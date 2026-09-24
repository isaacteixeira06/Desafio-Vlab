<?php

namespace App\Exceptions;

use App\Enums\StatusSolicitacao;
use Exception;

class TransicaoStatusInvalidaException extends Exception
{
    public function __construct(StatusSolicitacao $atual, StatusSolicitacao $novo)
    {
        $permitidos = array_map(
            fn(StatusSolicitacao $s) => $s->value,
            $atual->proximosPermitidos()
        );

        $mensagem = empty($permitidos)
            ? "O status '{$atual->value}' é final e não permite alterações."
            : "Não é possível transicionar de '{$atual->value}' para '{$novo->value}'. "
              . "Próximos permitidos: " . implode(', ', $permitidos) . ".";

        parent::__construct($mensagem, 422);
    }
}