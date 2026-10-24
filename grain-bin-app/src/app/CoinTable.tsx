"use client";

import { useState } from "react";
import {
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import type { buildMovers, CoinRow } from "../lib/calc";
import { money, percent, signedMoney, signedPercent } from "../lib/format";

type Aggregate = ReturnType<typeof buildMovers>["total"];
type TableRow = Omit<CoinRow,"coin"> & {coin:Pick<CoinRow["coin"],"id"|"name"|"symbol">};
type Props = {rows:TableRow[]; other:Aggregate; total:Aggregate; excluded:number};
const priceFormat = new Intl.NumberFormat("en-US", {
  style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:6,
});
const metricClass = (value:number|null) => value===null||value===0?"":value<0?"decline":"metric-gain";

function Change({amount,pct}:{amount:number|null;pct:number|null}) {
  return <div className="table-metric">
    <span className={metricClass(amount)}>{amount!==null?signedMoney(amount):"n/a"}</span>
    <small className={metricClass(pct)}>{pct!==null?signedPercent(pct):"n/a"}</small>
  </div>;
}

const columns:ColumnDef<TableRow>[] = [
  {id:"coin",accessorFn:r=>r.coin.symbol,header:"Coin",cell:({row})=><>{row.original.coin.symbol}<small>{row.original.coin.name}</small></>},
  {id:"supply",accessorKey:"supply",header:"Reported USD value",cell:({row})=>money(row.original.supply)},
  {id:"share",accessorKey:"supply",header:"Share",cell:({row,table})=>{
    const total=(table.options.meta as {total:number|null}).total;
    return total!==null&&total>0?`${percent(row.original.supply,total)}%`:"n/a";
  }},
  {id:"change",accessorFn:r=>r.change??undefined,header:"Provider-month change",sortUndefined:"last",
    cell:({row})=><Change amount={row.original.change} pct={row.original.changePct}/>},
  {id:"price",accessorFn:r=>r.price??undefined,header:"Price",sortUndefined:"last",cell:({row})=>{
    const r=row.original;
    return <div className="table-metric"><span>{r.price!==null?priceFormat.format(r.price):"No price"}</span>
      {r.deviation!==null&&<small className={metricClass(Number(r.deviation.toFixed(2)))} aria-label={`Deviation from $1: ${signedPercent(r.deviation)}`}>{signedPercent(r.deviation)}</small>}
    </div>;
  }},
];

function AggregateRow({label,group,total,excluded=0}:{label:string;group:Aggregate;total:number|null;excluded?:number}) {
  const missing=group.missing+excluded;
  return <tr><th scope="row">{label}<small>{group.count} coins{missing>0?` · Partial change; ${missing} unavailable`:""}</small></th>
    <td>{group.supply!==null?money(group.supply):"n/a"}</td>
    <td>{group.supply!==null&&total!==null&&total>0?`${percent(group.supply,total)}%`:"n/a"}</td>
    <td><Change amount={group.change} pct={group.changePct}/></td><td className="not-applicable">Not applicable</td></tr>;
}

export default function CoinTable({rows,other,total,excluded}:Props) {
  "use no memo"; // TanStack's stateful table functions must not be compiler-memoized.
  const [sorting,setSorting]=useState<SortingState>([{id:"supply",desc:true}]);
  // eslint-disable-next-line react-hooks/incompatible-library -- Explicit no-memo component; table functions stay local.
  const table=useReactTable({data:rows,columns,meta:{total:total.supply},state:{sorting},onSortingChange:setSorting,
    getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getRowId:r=>r.coin.id,
    enableSortingRemoval:false,enableMultiSort:false});
  return <div className="table-scroll coin-table-scroll" role="region" aria-label="Largest stablecoins and provider-month changes" tabIndex={0}>
    <table className="market-table movers-table coin-table">
      <caption>Top 10 by reported circulating value, not by size of change. Shares use the available token-level total.</caption>
      <thead>{table.getHeaderGroups().map(group=><tr key={group.id}>{group.headers.map(header=>{
        const sorted=header.column.getIsSorted();
        const title=String(header.column.columnDef.header);
        return <th key={header.id} scope="col" aria-sort={sorted==="asc"?"ascending":sorted==="desc"?"descending":"none"}>
          <button type="button" className="table-sort" onClick={header.column.getToggleSortingHandler()}
            aria-label={`${title}: sort ${header.column.getNextSortingOrder()==="asc"?"ascending":"descending"}`}>
            {flexRender(header.column.columnDef.header,header.getContext())}<span aria-hidden="true">{sorted==="asc"?"↑":sorted==="desc"?"↓":"↕"}</span>
          </button>
        </th>;
      })}</tr>)}</thead>
      <tbody>{table.getRowModel().rows.map(row=><tr key={row.id}>{row.getVisibleCells().map(cell=>
        cell.column.id==="coin"?<th key={cell.id} scope="row">{flexRender(cell.column.columnDef.cell,cell.getContext())}</th>:
          <td key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>
      )}</tr>)}</tbody>
      <tfoot>
        <AggregateRow label="All other coins" group={other} total={total.supply}/>
        <AggregateRow label={excluded?"Available total (partial)":"Total"} group={total} total={total.supply} excluded={excluded}/>
      </tfoot>
    </table>
  </div>;
}
