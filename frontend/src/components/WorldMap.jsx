import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const LENS_RADIUS = 60;
const LENS_ZOOM = 2.2;

/**
 * WorldMap — D3-based world map with race location pins and magnifying lens.
 * Props:
 *   races: [{ race_id, round, race_name, lat, lng }]
 *   onRaceClick: (race) => void
 */
export default function WorldMap({ races = [], onRaceClick }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = svgRef.current.getBoundingClientRect();
    if (!width || !height) return;

    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 6.2)
      .translate([width / 2, height / 2]);
    const path = d3.geoPath(projection);

    const mapGroup = svg.append("g").attr("id", "mapGroup");
    const landG = mapGroup.append("g").attr("class", "land-layer");
    const dotsG = mapGroup.append("g").attr("class", "dots-layer");

    // Load world topology
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((topo) => {
        const countries = topojson.feature(topo, topo.objects.countries).features;
        landG
          .selectAll("path")
          .data(countries)
          .join("path")
          .attr("d", path)
          .attr("fill", "#1b2431")
          .attr("stroke", "#2f3b4d")
          .attr("stroke-width", 0.5);

        // Race dots
        dotsG
          .selectAll("circle")
          .data(races, (d) => d.race_id)
          .join("circle")
          .attr("cx", (d) => projection([d.lng, d.lat])[0])
          .attr("cy", (d) => projection([d.lng, d.lat])[1])
          .attr("r", 0)
          .attr("fill", "#e10600")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .style("cursor", "pointer")
          .on("click", (_, d) => onRaceClick && onRaceClick(d))
          .on("mouseenter", (event, d) => {
            const tooltip = tooltipRef.current;
            if (!tooltip) return;
            tooltip.textContent = d.race_name;
            tooltip.style.opacity = "1";
            const [x, y] = d3.pointer(event, svgRef.current);
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y - 35}px`;
          })
          .on("mouseleave", () => {
            const tooltip = tooltipRef.current;
            if (tooltip) tooltip.style.opacity = "0";
          })
          .transition()
          .duration(400)
          .attr("r", 5);

        // Magnifying lens
        setupLens(svg, width, height);
      })
      .catch((e) => console.warn("World atlas failed to load", e));
  }, [races, onRaceClick]);

  function setupLens(svg) {
    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", "lensClip")
      .append("circle")
      .attr("id", "lensCircle")
      .attr("r", LENS_RADIUS)
      .attr("cx", -9999)
      .attr("cy", -9999);

    const lens = svg.append("g").attr("class", "lens").style("display", "none");
    lens
      .append("use")
      .attr("id", "lensContent")
      .attr("href", "#mapGroup")
      .attr("clip-path", "url(#lensClip)");
    // Outer glow ring
    lens
      .append("circle")
      .attr("id", "lensGlow")
      .attr("r", LENS_RADIUS + 3)
      .attr("fill", "none")
      .attr("stroke", "rgba(225, 6, 0, 0.3)")
      .attr("stroke-width", 4)
      .style("filter", "blur(3px)");

    // Main ring
    lens
      .append("circle")
      .attr("id", "lensRing")
      .attr("r", LENS_RADIUS)
      .attr("fill", "none")
      .attr("stroke", "#e10600")
      .attr("stroke-width", 1.5)
      .style("filter", "drop-shadow(0 4px 12px rgba(0,0,0,0.6))");

    svg.on("mousemove.lens", (event) => {
      const [mx, my] = d3.pointer(event, svg.node());
      lens.style("display", null);
      svg.select("#lensCircle").attr("cx", mx).attr("cy", my);
      svg.select("#lensRing").attr("cx", mx).attr("cy", my);
      svg.select("#lensGlow").attr("cx", mx).attr("cy", my);
      svg
        .select("#lensContent")
        .attr(
          "transform",
          `translate(${mx},${my}) scale(${LENS_ZOOM}) translate(${-mx},${-my})`
        );
    });
    svg.on("mouseleave.lens", () => lens.style("display", "none"));
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-label="World map of race locations"
      />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          background: "rgba(10, 14, 20, 0.9)",
          border: "1px solid #e10600",
          borderRadius: "6px",
          padding: "5px 10px",
          fontSize: "12px",
          color: "#fff",
          whiteSpace: "nowrap",
          transform: "translateX(-50%)",
          transition: "opacity 0.15s",
          zIndex: 20,
        }}
      />
    </div>
  );
}
