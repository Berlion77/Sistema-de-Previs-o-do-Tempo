<?php
// ============================================================
// A Juba que Prevê — Mapa de Correção de Nomes de Cidades
// ============================================================

class CityNamesMap {
    // Mapa de nomes incorretos/antigos da API OpenWeather para nomes corretos
    private static array $corrections = [
        'Loanda' => 'Luanda',           // Nome antigo de Luanda, Angola
        'Leopoldville' => 'Kinshasa',   // Nome antigo de Kinshasa, Congo
        'Salisbury' => 'Harare',        // Nome antigo de Harare, Zimbabwe
        'Rhodesia' => 'Zimbabwe',       // Nome antigo
        'Batavia' => 'Jakarta',         // Nome antigo de Jakarta, Indonésia
        'Peking' => 'Beijing',          // Nome antigo de Beijing, China
        'Canton' => 'Guangzhou',        // Nome antigo de Guangzhou, China
        'Bombay' => 'Mumbai',           // Nome antigo de Mumbai, Índia
        'Calcutta' => 'Kolkata',        // Nome antigo de Kolkata, Índia
        'Madras' => 'Chennai',          // Nome antigo de Chennai, Índia
        'Saigon' => 'Ho Chi Minh City', // Nome antigo de Ho Chi Minh, Vietnã
        'Siam' => 'Thailand',           // Nome antigo da Tailândia
        'Constantinople' => 'Istanbul', // Nome antigo de Istanbul, Turquia
        'Leningrad' => 'St. Petersburg',// Nome antigo de São Petersburgo, Rússia
    ];

    /**
     * Corrige o nome da cidade se houver mapeamento
     */
    public static function correct(string $cityName): string {
        return self::$corrections[$cityName] ?? $cityName;
    }

    /**
     * Adiciona uma nova correção de nome
     */
    public static function addCorrection(string $incorrect, string $correct): void {
        self::$corrections[$incorrect] = $correct;
    }

    /**
     * Retorna todas as correções (útil para debug)
     */
    public static function getAll(): array {
        return self::$corrections;
    }
}
?>
