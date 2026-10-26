"use client";
import {useState} from "react";
import {flexRender,getCoreRowModel,getSortedRowModel,useReactTable,type ColumnDef,type SortingState} from "@tanstack/react-table";
import type {ChainRow} from "../lib/chains";
import {money,percent,signedMoney,signedPercent} from "../lib/format";
import "./MarketViews.css";

const columns:ColumnDef<ChainRow>[]=[
  {accessorKey:"name",header:"Chain"},
  {accessorKey:"value",header:"Reported USD value",cell:({row})=>money(row.original.value)},
  {id:"share",accessorKey:"value",header:"Chain share",cell:({row,table})=>{
    const total=(table.options.meta as {total:number}).total, share=row.original.value/total*100;
    return <>{share.toFixed(1)}%<div className="chain-track" aria-hidden="true"><span style={{width:`${share}%`}}/></div></>;
  }},
  {id:"dominant",accessorFn:row=>row.dominant?.symbols.join(" / "),header:"Dominant stablecoin",sortUndefined:"last",cell:({row})=>{
    const leader=row.original.dominant;
    return leader?<>{leader.symbols.join(" / ")}<small>{leader.symbols.length>1?"Tied · ":""}{leader.share.toFixed(1)}% of chain{leader.symbols.length>1?" each":""}</small></>:"n/a";
  }},
  {id:"change",accessorFn:row=>row.change??undefined,header:"Provider-month change",sortUndefined:"last",cell:({row})=>{
    const r=row.original;
    return <><span className={r.change!==null&&r.change<0?"decline":r.change!==null&&r.change>0?"metric-gain":""}>{r.change!==null?signedMoney(r.change):"n/a"}</span>
      <small className={r.changePct!==null&&r.changePct<0?"decline":r.changePct!==null&&r.changePct>0?"metric-gain":""}>{r.changePct!==null?signedPercent(r.changePct):"n/a"}</small>
      {r.missing>0&&<small>Partial: {r.missing} missing baselines</small>}</>;
  }},
];
export default function ChainTable({rows,total,other}:{rows:ChainRow[];total:number;other:{name:string;value:number;count:number}}) {
  "use no memo";
  const [sorting,setSorting]=useState<SortingState>([{id:"value",desc:true}]);
  // eslint-disable-next-line react-hooks/incompatible-library -- Explicit no-memo component; stateful table functions stay local.
  const table=useReactTable({data:rows,columns,meta:{total},state:{sorting},onSortingChange:setSorting,getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getRowId:r=>r.name,enableSortingRemoval:false,enableMultiSort:false});
  return <div className="table-scroll" role="region" aria-label="Stablecoins by chain" tabIndex={0}>
    <table className="market-table coin-table chain-table"><caption>Top eight chains by available USD-pegged circulating value · Source: DefiLlama</caption>
      <thead>{table.getHeaderGroups().map(g=><tr key={g.id}>{g.headers.map(h=>{
        const order=h.column.getIsSorted();
        return <th scope="col" key={h.id} aria-sort={order==="asc"?"ascending":order==="desc"?"descending":"none"}><button type="button" className="table-sort" onClick={h.column.getToggleSortingHandler()} aria-label={`${h.column.columnDef.header}: sort ${h.column.getNextSortingOrder()==="asc"?"ascending":"descending"}`}>
          {flexRender(h.column.columnDef.header,h.getContext())}<span aria-hidden="true">{order==="asc"?"↑":order==="desc"?"↓":"↕"}</span>
        </button></th>;
      })}</tr>)}</thead>
      <tbody>{table.getRowModel().rows.map(r=><tr key={r.id}>{r.getVisibleCells().map(c=>c.column.id==="name"?<th scope="row" key={c.id}>{flexRender(c.column.columnDef.cell,c.getContext())}</th>:<td key={c.id}>{flexRender(c.column.columnDef.cell,c.getContext())}</td>)}</tr>)}</tbody>
      <tfoot><tr><th scope="row">Other chains<small>{other.count} chains</small></th><td>{money(other.value)}</td><td>{percent(other.value,total)}%</td><td>Not applicable</td><td>Not combined</td></tr><tr><th scope="row">Available chain total</th><td>{money(total)}</td><td>100.0%</td><td>Not applicable</td><td>Not combined</td></tr></tfoot>
    </table>
  </div>;
}
