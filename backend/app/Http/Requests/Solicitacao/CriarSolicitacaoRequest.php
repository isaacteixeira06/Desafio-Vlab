<?php

namespace App\Http\Requests\Solicitacao;

use App\Enums\CategoriaSolicitacao;
use App\Enums\PrioridadeSolicitacao;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CriarSolicitacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome_solicitante'        => ['required', 'string', 'max:150'],
            'categoria'               => ['required', Rule::enum(CategoriaSolicitacao::class)],
            'prioridade'              => ['required', Rule::enum(PrioridadeSolicitacao::class)],
            'descricao'               => ['required', 'string', 'max:2000'],
            'justificativa_prioridade'=> [
                Rule::requiredIf(fn() => $this->input('prioridade') === 'URGENTE'),
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nome_solicitante.required'         => 'O nome do solicitante é obrigatório.',
            'nome_solicitante.max'              => 'O nome do solicitante não pode ultrapassar 150 caracteres.',
            'categoria.required'               => 'A categoria é obrigatória.',
            'categoria.enum'                   => 'Categoria inválida. Use: CONSULTA, EXAME, VACINACAO ou OUTRO.',
            'prioridade.required'              => 'A prioridade é obrigatória.',
            'prioridade.enum'                  => 'Prioridade inválida. Use: BAIXA, MEDIA, ALTA ou URGENTE.',
            'descricao.required'               => 'A descrição é obrigatória.',
            'descricao.max'                    => 'A descrição não pode ultrapassar 2000 caracteres.',
            'justificativa_prioridade.required_if' => 'A justificativa de prioridade é obrigatória para solicitações URGENTES.',
            'justificativa_prioridade.max'     => 'A justificativa não pode ultrapassar 1000 caracteres.',
        ];
    }
}