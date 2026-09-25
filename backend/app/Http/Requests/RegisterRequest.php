<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:100'],
            'email'                 => ['required', 'email', 'max:150', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                  => 'O nome é obrigatório.',
            'name.max'                       => 'O nome não pode ultrapassar 100 caracteres.',
            'email.required'                 => 'O e-mail é obrigatório.',
            'email.email'                    => 'Informe um e-mail válido.',
            'email.unique'                   => 'Este e-mail já está cadastrado.',
            'password.required'              => 'A senha é obrigatória.',
            'password.min'                   => 'A senha deve ter pelo menos 8 caracteres.',
            'password.confirmed'             => 'A confirmação de senha não confere.',
            'password_confirmation.required' => 'Confirme a senha.',
        ];
    }
}