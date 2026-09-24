<?php

namespace App\Http\Requests\Solicitacao;

use App\Enums\StatusSolicitacao;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizarStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(StatusSolicitacao::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'O novo status é obrigatório.',
            'status.enum'     => 'Status inválido. Use: ' . implode(', ', StatusSolicitacao::values()) . '.',
        ];
    }
}