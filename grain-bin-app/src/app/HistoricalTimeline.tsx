"use client";
import {useState} from "react";
import type {HistoryPoint} from "../lib/calc";
import {buildTimeline,eventsInWindow,type MarketEvent} from "../lib/timeline";
import {fullDate,money} from "../lib/format";
import HistoricalChart from "./HistoricalChart";
import "./HistoricalTimeline.css";

export default function HistoricalTimeline({history,events}:{history:HistoryPoint[];events:MarketEvent[]}) {
  const [range,setRange]=useState<"all"|"year">("all");
  const m=buildTimeline(history,range);
  if(m.start===null||m.end===null||!m.high||!m.low)return <p className="empty-data">Not enough valid aggregate history to chart.</p>;
  const shown=eventsInWindow(events,m.start,m.end);
  return <>
    <div className="timeline-range" role="group" aria-label="Historical chart range">
      <button type="button" aria-pressed={range==="year"} onClick={()=>setRange("year")}>1 year</button>
      <button type="button" aria-pressed={range==="all"} onClick={()=>setRange("all")}>All history</button>
    </div>
    <p className="chart-topline">{fullDate(m.start)} – {fullDate(m.end)} UTC · Source: DefiLlama</p>
    {m.points.length>1?<HistoricalChart points={m.points} high={m.high} low={m.low} events={shown}
      description={`Historical USD-pegged circulating value from ${fullDate(m.start)} to ${fullDate(m.end)}. Missing observations are gaps. ${shown.length} sourced event annotations are listed below; proximity does not establish causation.`}/>:<p className="empty-data">Not enough observations to chart this range.</p>}
    <p className="data-note chart-extrema tabular"><span>Low {money(m.low.supply)} · {fullDate(m.low.date)}</span><span>High {money(m.high.supply)} · {fullDate(m.high.date)}</span></p>
    {shown.length?<ol className="timeline-events" aria-label="Sourced historical events">{shown.map(event=><li key={event.id}><div><time dateTime={event.date}>{fullDate(Date.parse(`${event.date}T00:00:00Z`))} UTC</time><a href={event.sourceUrl}>{event.label} <span aria-hidden="true">↗</span></a></div></li>)}</ol>:<p className="data-note">No event annotations in this range.</p>}
    <p className="data-note">The axis starts at the earliest available aggregate observation. Earlier supply is unavailable, not zero. Provider coverage can change over time; these values reflect the reported dataset. Event timing provides context and does not establish a cause for market moves.</p>
  </>;
}
