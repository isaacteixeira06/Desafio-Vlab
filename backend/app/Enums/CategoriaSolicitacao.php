<?php

namespace App\Enums;

enum CategoriaSolicitacao: string
{
    case CONSULTA  = 'CONSULTA';
    case EXAME     = 'EXAME';
    case VACINACAO = 'VACINACAO';
    case OUTRO     = 'OUTRO';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}