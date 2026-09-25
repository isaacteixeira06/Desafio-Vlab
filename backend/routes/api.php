<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\SolicitacaoController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ── Health check (público) ────────────────────────────────────────────────
    Route::get('/health', function () {
        return response()->json([
            'status'    => 'ok',
            'database'  => DB::connection()->getPdo() ? 'connected' : 'disconnected',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // ── Autenticação (público) ────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);

        // Requer token válido
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me',      [AuthController::class, 'me']);
        });
    });

    // ── Solicitações (protegidas) ─────────────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('solicitacoes')->group(function () {
        Route::get('/',              [SolicitacaoController::class, 'index']);
        Route::post('/',             [SolicitacaoController::class, 'store']);
        Route::get('/{id}',          [SolicitacaoController::class, 'show']);
        Route::patch('/{id}/status', [SolicitacaoController::class, 'atualizarStatus']);
    });

});