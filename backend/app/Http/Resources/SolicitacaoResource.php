<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'protocolo'               => $this->protocolo,
            'nome_solicitante'        => $this->nome_solicitante,
            'categoria'               => $this->categoria->value,
            'prioridade'              => $this->prioridade->value,
            'status'                  => $this->status->value,
            'descricao'               => $this->descricao,
            'justificativa_prioridade'=> $this->justificativa_prioridade,
            'proximos_status'         => array_map(
                fn($s) => $s->value,
                $this->status->proximosPermitidos()
            ),
            'data_criacao'            => $this->created_at?->toIso8601String(),
            'data_atualizacao'        => $this->updated_at?->toIso8601String(),
        ];
    }
}