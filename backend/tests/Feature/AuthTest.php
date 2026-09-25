<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

// =============================================================================
// POST /api/v1/auth/register
// =============================================================================

describe('POST /api/v1/auth/register', function () {

    it('registra um novo usuário e retorna token', function () {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Maria Silva',
            'email'                 => 'maria@example.com',
            'password'              => 'senha1234',
            'password_confirmation' => 'senha1234',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email'], 'token'])
            ->assertJsonPath('user.email', 'maria@example.com');

        $this->assertDatabaseHas('users', ['email' => 'maria@example.com']);
    });

    it('rejeita e-mail duplicado', function () {
        User::factory()->create(['email' => 'existente@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Outro',
            'email'                 => 'existente@example.com',
            'password'              => 'senha1234',
            'password_confirmation' => 'senha1234',
        ])->assertStatus(422)
          ->assertJsonPath('errors.email.0', 'Este e-mail já está cadastrado.');
    });

    it('rejeita senha fraca (menos de 8 caracteres)', function () {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'João',
            'email'                 => 'joao@example.com',
            'password'              => '123',
            'password_confirmation' => '123',
        ])->assertStatus(422)
          ->assertJsonStructure(['errors' => ['password']]);
    });

    it('rejeita quando confirmação de senha não confere', function () {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'João',
            'email'                 => 'joao@example.com',
            'password'              => 'senha1234',
            'password_confirmation' => 'outrasenha',
        ])->assertStatus(422)
          ->assertJsonStructure(['errors' => ['password']]);
    });

    it('rejeita campos obrigatórios ausentes', function () {
        $this->postJson('/api/v1/auth/register', [])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['name', 'email', 'password']]);
    });

    it('não expõe a senha na resposta', function () {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Seguro',
            'email'                 => 'seguro@example.com',
            'password'              => 'senha1234',
            'password_confirmation' => 'senha1234',
        ]);

        $response->assertStatus(201);
        expect($response->json())->not->toHaveKey('user.password');
    });
});

// =============================================================================
// POST /api/v1/auth/login
// =============================================================================

describe('POST /api/v1/auth/login', function () {

    it('autentica com credenciais válidas e retorna token', function () {
        User::factory()->create([
            'email'    => 'user@example.com',
            'password' => bcrypt('senha1234'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'user@example.com',
            'password' => 'senha1234',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    });

    it('rejeita senha incorreta com 401', function () {
        User::factory()->create([
            'email'    => 'user@example.com',
            'password' => bcrypt('correta'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => 'user@example.com',
            'password' => 'errada',
        ])->assertStatus(401)
          ->assertJsonPath('message', 'Credenciais inválidas.');
    });

    it('rejeita e-mail inexistente com 401', function () {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'naoexiste@example.com',
            'password' => 'qualquer',
        ])->assertStatus(401);
    });

    it('rejeita campos obrigatórios ausentes', function () {
        $this->postJson('/api/v1/auth/login', [])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['email', 'password']]);
    });
});

// =============================================================================
// POST /api/v1/auth/logout
// =============================================================================

describe('POST /api/v1/auth/logout', function () {

    it('revoga o token e retorna sucesso', function () {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200)
            ->assertJsonPath('message', 'Logout realizado com sucesso.');

        // Token revogado — próxima requisição deve falhar
        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    });

    it('rejeita logout sem token', function () {
        $this->postJson('/api/v1/auth/logout')
            ->assertStatus(401);
    });
});

// =============================================================================
// GET /api/v1/auth/me
// =============================================================================

describe('GET /api/v1/auth/me', function () {

    it('retorna dados do usuário autenticado', function () {
        $user = User::factory()->create(['name' => 'Ana Lima', 'email' => 'ana@example.com']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('name', 'Ana Lima')
            ->assertJsonPath('email', 'ana@example.com');
    });

    it('rejeita acesso sem autenticação com 401', function () {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    });
});

// =============================================================================
// Proteção das rotas de solicitações
// =============================================================================

describe('Rotas de solicitações requerem autenticação', function () {

    it('GET /solicitacoes retorna 401 sem token', function () {
        $this->getJson('/api/v1/solicitacoes')->assertStatus(401);
    });

    it('POST /solicitacoes retorna 401 sem token', function () {
        $this->postJson('/api/v1/solicitacoes', [])->assertStatus(401);
    });

    it('GET /solicitacoes funciona com token válido', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/solicitacoes')
            ->assertStatus(200);
    });
});