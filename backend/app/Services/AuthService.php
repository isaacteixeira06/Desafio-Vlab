<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Registra um novo usuário e retorna o token de acesso.
     */
    public function registrar(array $dados): array
    {
        $user = User::create([
            'name'     => $dados['name'],
            'email'    => $dados['email'],
            'password' => $dados['password'], // cast 'hashed' no model
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Autentica o usuário e retorna o token de acesso.
     *
     * @throws AuthenticationException
     */
    public function login(array $dados): array
    {
        $user = User::where('email', $dados['email'])->first();

        if (!$user || !Hash::check($dados['password'], $user->password)) {
            throw new AuthenticationException('Credenciais inválidas.');
        }

        // Revoga tokens anteriores para manter apenas uma sessão ativa
        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Revoga o token atual do usuário (logout).
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}