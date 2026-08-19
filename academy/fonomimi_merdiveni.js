<!DOCTYPE html>
<html lang="tr">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>VOCALY – Fonomimi Merdiveni</title>

<link rel="stylesheet" href="fonomimi_merdiveni.css">
</head>

<body>

<header class="topbar">

    <div class="game-title">
        <span>🎵</span>
        <strong>FONOMİMİ MERDİVENİ</strong>
    </div>

    <div class="character-select">

        <button id="lokiBtn" class="character-btn active">
            🐱 Loki
        </button>

        <button id="mayaBtn" class="character-btn">
            🐈‍⬛ Maya
        </button>

    </div>

    <div class="stats">

        <div>
            🪙 <span id="coinCount">0</span>
        </div>

        <div>
            ⭐ <span id="score">0</span>
        </div>

    </div>

</header>


<main class="game">

<section class="game-world">


    <div class="level-info">

        <strong>SEVİYE 1</strong>

        <span>
            Do – Do'
        </span>

        <div class="combo">
            🔥 Zincir
            <b id="combo">0</b>
        </div>

    </div>



    <!-- OYUN ALANI -->

    <div id="ladder" class="ladder">


        <!-- BAŞLANGIÇ NOKTASI -->

        <div
            id="startPoint"
            class="start-point"
        >

            <div class="start-flag">
                BAŞLA
            </div>

            <div class="start-mark">
                ★
            </div>

        </div>



        <!-- BASAMAKLAR -->

        <div
            class="step step-do"
            data-index="0"
            data-note="DO"
        >

            <div class="step-note">
                DO
            </div>

            <div
                class="hand-sign"
                data-note="DO"
            ></div>

            <button
                class="coin"
                data-index="0"
                aria-label="Do referans sesi"
            >
                🪙
            </button>

        </div>



        <div
            class="step step-re"
            data-index="1"
            data-note="RE"
        >

            <div class="step-note">
                RE
            </div>

            <div
                class="hand-sign"
                data-note="RE"
            ></div>

            <button
                class="coin"
                data-index="1"
                aria-label="Re referans sesi"
            >
                🪙
            </button>

        </div>



        <div
            class="step step-mi"
            data-index="2"
            data-note="MI"
        >

            <div class="step-note">
                Mİ
            </div>

            <div
                class="hand-sign"
                data-note="MI"
            ></div>

            <button
                class="coin"
                data-index="2"
                aria-label="Mi referans sesi"
            >
                🪙
            </button>

        </div>



        <div
            class="step step-fa"
            data-index="3"
            data-note="FA"
        >

            <div class="step-note">
                FA
            </div>

            <div
                class="hand-sign"
                data-note="FA"
            ></div>

            <button
                class="coin"
                data-index="3"
                aria-label="Fa referans sesi"
            >
                🪙
            </button>

        </div>



        <div
            class="step step-sol"
            data-index="4"
            data-note="SOL"
        >

            <div class="step-note">
                SOL
            </div>

            <div
                class="hand-sign"
                data-note="SOL"
            ></div>

            <button
                class="coin"
                data-index="4"
                aria-label="Sol referans sesi"
            >
                🪙
            </button>

        </div>



        <div
            class="step step-la"
            data-index="5"
            data-note="LA"
        >

            <div class="step-note">
                LA
            </div>

            <div
                class="hand-sign"
                data-note="LA"
            ></div>

            <button
                class="coin"
                data-index="5"
                aria-label="La referans sesi"
            >
                🪙
            </button>

        </div>



        <div
            class="step step-si"
            data-index="6"
            data-note="SI"
        >

            <div class="step-note">
                Sİ
            </div>

            <div
                class="hand-sign"
                data-note="SI"
            ></div>

            <button
                class="coin"
                data-index="6"
                aria-label="Si referans sesi"
            >
                🪙
            </button>

        </div>



        <div
            class="step step-do2"
            data-index="7"
            data-note="DO2"
        >

            <div class="step-note">
                DO'
            </div>

            <div
                class="hand-sign"
                data-note="DO2"
            ></div>

            <button
                class="coin"
                data-index="7"
                aria-label="Üst Do referans sesi"
            >
                🪙
            </button>

        </div>



        <!-- KEDİ -->

        <div
            id="cat"
            class="cat loki"
            aria-label="Loki"
        >

            <svg
                class="cat-svg"
                viewBox="0 0 100 100"
            >

                <path
                    class="cat-body"
                    d="M27 39
                       L22 17
                       L39 27
                       Q50 22 61 27
                       L78 17
                       L73 40
                       Q82 51 78 67
                       Q73 84 50 84
                       Q27 84 22 67
                       Q18 51 27 39Z"
                />

                <circle
                    class="cat-eye"
                    cx="38"
                    cy="49"
                    r="5"
                />

                <circle
                    class="cat-eye"
                    cx="62"
                    cy="49"
                    r="5"
                />

                <path
                    class="cat-face"
                    d="M45 61 Q50 65 55 61"
                />

                <path
                    class="cat-face"
                    d="M50 58 L50 64"
                />

                <path
                    class="cat-whisker"
                    d="M38 61 L17 57"
                />

                <path
                    class="cat-whisker"
                    d="M38 66 L17 67"
                />

                <path
                    class="cat-whisker"
                    d="M62 61 L83 57"
                />

                <path
                    class="cat-whisker"
                    d="M62 66 L83 67"
                />

            </svg>

        </div>


    </div>



    <!-- PITCH -->

    <aside class="pitch-panel">

        <div class="pitch-title">
            PITCH
        </div>

        <div class="pitch-meter">

            <div
                id="pitchFill"
                class="pitch-fill"
            ></div>

            <div class="pitch-center"></div>

        </div>

        <div
            id="pitchStatus"
            class="pitch-status"
        >
            HAZIR
        </div>

        <div
            id="pitchHz"
            class="pitch-hz"
        >
            —
        </div>

    </aside>



    <!-- KÜÇÜK ALT PANEL -->

    <section class="bottom-panel">

        <div class="target">

            <small>
                HEDEF NOTA
            </small>

            <div id="targetNote">
                DO
            </div>

            <div
                id="targetHand"
                class="target-hand"
            ></div>

        </div>


        <button
            id="micBtn"
            class="mic-button"
        >
            🎤 Mikrofon
        </button>


        <div
            id="instruction"
            class="instruction"
        >
            Do sesini söyle.
        </div>

    </section>


</section>



<section class="controls">

    <button id="startBtn">
        ▶ BAŞLA
    </button>

    <button id="resetBtn">
        ↻ YENİDEN
    </button>

</section>


</main>


<script src="fonomimi_merdiveni.js"></script>

</body>
</html>
