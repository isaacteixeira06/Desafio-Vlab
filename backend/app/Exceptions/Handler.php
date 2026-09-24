<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return $this->handleApiException($e);
            }
        });
    }

    private function handleApiException(Throwable $e): JsonResponse
    {
        // Modelo não encontrado 404
        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return response()->json([
                'message' => 'Recurso não encontrado.',
            ], 404);
        }

        // Validação 422
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'Os dados fornecidos são inválidos.',
                'errors'  => $e->errors(),
            ], 422);
        }

       
        $status  = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
        $message = app()->isProduction() && $status === 500
            ? 'Erro interno do servidor.'
            : $e->getMessage();

        return response()->json(['message' => $message], $status);
    }
}