<?php
$variableGlobal = 10; // Variable global

function ejemploFuncion() {
    $variableLocal = 5; // Variable local dentro de la función
    global $variableGlobal; // Acceder a la variable global dentro de la función
    echo "Variable local: " . $variableLocal . "<br>";
    echo "Variable global desde la función: " . $variableGlobal . "<br>";
}

echo "Variable global fuera de la función: " . $variableGlobal . "<br>";
ejemploFuncion();
?>
