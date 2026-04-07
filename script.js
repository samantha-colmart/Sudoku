
const grille = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],

    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],

    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];


for (let ligne = 0; ligne < 9; ligne++) {
    for (let col = 0; col < 9; col++) {
        const input = document.getElementById(`case${ligne}-${col}`);
        const valeur = grille[ligne][col];

        if (valeur !== 0) {
            input.value = valeur;
            input.disabled = true;
            input.classList.add("fixe");
        }
        input.addEventListener("input", verifierSudoku);
    }
}

function verifierSudoku() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.classList.remove("invalide")
    });

    // vérif lignes
    for (let ligne = 0; ligne < 9; ligne++) {
        verifierLigne(ligne);
    }

    // vérif colonnes
    for (let col = 0; col < 9; col++) {
        verifierColonne(col);
    }

    // vérifier carrés
    for (let blocLigne = 0; blocLigne < 3; blocLigne++) {
        for (let blocCol = 0; blocCol < 3; blocCol++) {
            verifierCarre(blocLigne, blocCol);
        }
    }
}

function verifierLigne(ligne) {
    const dejaVus = [];

    for (let col = 0; col < 9; col++) {
        const input = document.getElementById(`case${ligne}-${col}`);
        const valeur = input.value;

        if (valeur !== "") {
            if (dejaVus.includes(valeur)) {
                input.classList.add("invalide");
            } else {
                dejaVus.push(valeur);
            }
        }
    }
}

function verifierColonne(col) {
    const dejaVus = [];

    for (let ligne = 0; ligne < 9; ligne++) {
        const input = document.getElementById(`case${ligne}-${col}`);
        const valeur = input.value;

        if (valeur !== "") {

            if (dejaVus.includes(valeur)) {
                input.classList.add("invalide");
            } else {
                dejaVus.push(valeur);
            }
        }
    }
}

function verifierCarre(blocLigne, blocCol) {
    const dejaVus = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {

            const ligne = blocLigne * 3 + i;
            const col = blocCol * 3 + j;

            const input = document.getElementById(`case${ligne}-${col}`);
            const valeur = input.value;

            if (valeur !== "") {
                if (dejaVus.includes(valeur)) {
                    input.classList.add("invalide");
                } else {
                    dejaVus.push(valeur);
                }
            }
        }
    }
}