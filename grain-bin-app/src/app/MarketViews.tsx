"use client";
import { useId, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import "./MarketViews.css";

export default function MarketViews({coin,chain}:{coin:ReactNode;chain:ReactNode}) {
  const [selected,setSelected]=useState(0), id=useId();
  const buttons=useRef<(HTMLButtonElement|null)[]>([]);
  function onKey(event:KeyboardEvent,index:number) {
    const next=event.key==="Home"?0:event.key==="End"?1:event.key==="ArrowRight"?1-index:event.key==="ArrowLeft"?1-index:null;
    if(next===null)return;
    event.preventDefault();setSelected(next);buttons.current[next]?.focus();
  }
  return <>
    <div className="market-tabs" role="tablist" aria-label="Market breakdown">
      {["Coin","Chain"].map((label,index)=><button key={label} type="button" role="tab" id={`${id}-tab-${index}`}
        aria-controls={`${id}-panel-${index}`} aria-selected={selected===index} tabIndex={selected===index?0:-1}
        ref={element=>{buttons.current[index]=element;}} onClick={()=>setSelected(index)} onKeyDown={e=>onKey(e,index)}>{label}</button>)}
    </div>
    {[coin,chain].map((content,index)=><div key={index} role="tabpanel" id={`${id}-panel-${index}`}
      aria-labelledby={`${id}-tab-${index}`} hidden={selected!==index}>{content}</div>)}
  </>;
}
