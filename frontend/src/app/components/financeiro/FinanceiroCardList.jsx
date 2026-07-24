"use client";

import FinanceiroDashboard from "./FinanceiroDashboard";
import FinanceiroReceitas from "./FinanceiroReceitas";
import FinanceiroDespesas from "./FinanceiroDespesas";
import FinanceiroProximosVencimentos from "./FinanceiroProximosVencimentos";
import FinanceiroInadimplencia from "./FinanceiroInadimplencia";
import FinanceiroRelatorios from "./FinanceiroRelatorios";

export default function FinanceiroCardList(props) {

  return (
    <div className="space-y-8">

      <FinanceiroDashboard
        receitas={props.receitas}
        despesas={props.despesas}
      />

      <FinanceiroReceitas
        receitas={props.receitas}
        onDelete={props.onDeleteReceita}
        onUpdate={props.onUpdateReceita}
        onMarcarPago={props.onMarcarPago}
      />

      <FinanceiroDespesas
        despesas={props.despesas}
        onDelete={props.onDeleteDespesa}
        onUpdate={props.onUpdateDespesa}
      />

      <FinanceiroProximosVencimentos
        receitas={props.receitas}
      />

      <FinanceiroInadimplencia
        receitas={props.receitas}
      />

      <FinanceiroRelatorios
        receitas={props.receitas}
        despesas={props.despesas}
      />

    </div>
  );

}