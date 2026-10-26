"use client";
import {useRef,useState} from "react";
import type {HistoryPoint} from "../lib/calc";
import {buildTimeline,eventsInWindow,type MarketEvent} from "../lib/timeline";
import {fullDate,money} from "../lib/format";
import HistoricalChart from "./HistoricalChart";
import "./HistoricalTimeline.css";

export default function HistoricalTimeline({history,events}:{history:HistoryPoint[];events:MarketEvent[]}) {
  const [range,setRange]=useState<"all"|"year">("all");
  const [selected,setSelected]=useState<MarketEvent|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const opener=useRef<string|null>(null);
  function openEvent(event:MarketEvent,trigger=`list-${event.id}`) {opener.current=trigger;setSelected(event);dialog.current?.showModal();}
  function eventDate(event:MarketEvent) {return event.datePrecision==="month"?new Intl.DateTimeFormat("en-US",{month:"short",year:"numeric",timeZone:"UTC"}).format(Date.parse(`${event.date}T00:00:00Z`)):fullDate(Date.parse(`${event.date}T00:00:00Z`));}
  const m=buildTimeline(history,range);
  if(m.start===null||m.end===null||!m.high||!m.low)return <p className="empty-data">Not enough valid aggregate history to chart.</p>;
  const shown=eventsInWindow(events,m.start,m.end).map((event,index)=>({...event,markerNumber:index+1}));
  const markers=shown.filter(event=>(event.importance??1)<=(range==="year"?2:1));
  return <>
    <div className="timeline-range" role="group" aria-label="Historical chart range">
      <button type="button" aria-pressed={range==="year"} onClick={()=>setRange("year")}>1 year</button>
      <button type="button" aria-pressed={range==="all"} onClick={()=>setRange("all")}>All history</button>
    </div>
    <p className="chart-topline">{fullDate(m.start)} – {fullDate(m.end)} UTC · Source: DefiLlama</p>
    {m.points.length>1?<HistoricalChart points={m.points} high={m.high} low={m.low} events={markers} onEventSelect={event=>openEvent(event,`chart-${event.id}`)}
      description={`Historical USD-pegged circulating value from ${fullDate(m.start)} to ${fullDate(m.end)}. Missing observations are gaps. ${shown.length} editorial event annotations are available below; proximity does not establish causation.`}/>:<p className="empty-data">Not enough observations to chart this range.</p>}
    <p className="data-note chart-extrema tabular"><span>Low {money(m.low.supply)} · {fullDate(m.low.date)}</span><span>High {money(m.high.supply)} · {fullDate(m.high.date)}</span></p>
    {shown.length?<details className="timeline-event-disclosure"><summary>Explore all events</summary><ol className="timeline-events" aria-label="Historical events">{shown.map(event=><li key={event.id}><button type="button" className="timeline-event-link" data-event-trigger={`list-${event.id}`} onClick={()=>openEvent(event)} aria-haspopup="dialog"><time dateTime={event.datePrecision==="month"?event.date.slice(0,7):event.date}>{eventDate(event)}</time><strong>{event.label}</strong></button></li>)}</ol></details>:<p className="data-note">No event annotations in this range.</p>}
    <dialog ref={dialog} className="timeline-event-card" aria-labelledby="event-card-title" onClose={()=>{setSelected(null);requestAnimationFrame(()=>{if(opener.current)document.querySelector<HTMLElement>(`[data-event-trigger="${CSS.escape(opener.current)}"]`)?.focus();});}} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
      <div className="timeline-event-card-content">
        <button type="button" className="timeline-event-close" onClick={()=>dialog.current?.close()} autoFocus aria-label="Close event card">Close ×</button>
        {selected&&<><p className="section-kicker">{eventDate(selected)}</p><h3 id="event-card-title">{selected.label}</h3><p>{selected.summary}</p></>}
      </div>
    </dialog>

    <p className="data-note">The axis starts at the earliest available aggregate observation. Earlier supply is unavailable, not zero. Provider coverage can change over time; these values reflect the reported dataset. Event timing provides context and does not establish a cause for market moves.</p>
  </>;
}
