<!-- Screen4.svelte -->
<script>
  // Функция, вызываемая при клике на кнопку «ПОЛУЧИТЬ ПРОМОКОД»
  function handlePromoClick() {
    console.log('Кнопка "ПОЛУЧИТЬ ПРОМОКОД" нажата');
    alert('Промокод получен! Нажмите ОК, чтобы продолжить.');
  }
</script>

<div class="about-project">
  <h2 class="project-title">О проекте</h2>
  <div class="project-frame">
    <!-- Блок Санты -->
    <div class="santa-image"></div>
    
    <div class="project-description">
      <p class="highlight-text">
        Выбирайте высокие коэффициенты, заключайте пари, получайте яркие эмоции от побед!
      </p>
      <p class="rules-text">Правила акции</p>
      <p class="details-text">
        CQ.ru совместно с букмекерской компанией «Лига Ставок» запустили новогодний проект. Делайте ставки на спортивные события с большими коэффициентами и выигрывайте топовые призы!
      </p>

      <!-- Используем <button> для лучшей семантики и доступности -->
      <button class="promo-button" on:click={handlePromoClick}>
        <span class="promo-button-text">ПОЛУЧИТЬ ПРОМОКОД</span>
      </button>
    </div>

    <div class="right-column">
      <!-- Блок для "Получите промокод" с одной лампочкой -->
      <div class="lamp-text-block">
        <div class="image-frame">
          <div class="image image-lamp"></div>
        </div>
        <p class="row-text">Получите промокод</p>
      </div>

      <!-- Блок для "Заключайте пари" с двумя лампочками -->
      <div class="lamp-text-block">
        <div class="image-frame">
          <div class="image image-lamp"></div>
          <div class="image image-lamp"></div>
        </div>
        <p class="row-text">Заключайте пари в «Лиге Ставок»</p>
      </div>

      <!-- Блок для "Следите за розыгрышами призов" с тремя лампочками -->
      <div class="lamp-text-block">
        <div class="image-frame">
          <div class="image image-lamp"></div>
          <div class="image image-lamp"></div>
          <div class="image image-lamp"></div>
        </div>
        <p class="row-text">Следите за розыгрышами призов</p>
      </div>
    </div>
  </div>
</div>

<style>
  .about-project {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px;
    gap: 32px;
    width: 100%;
    max-width: 1392px;
    background: #15154D;
    border-radius: 16px;
    margin: 0 auto;
  }

  .project-title {
    width: 1264px;
    height: 43px;
    font-family: 'TT Travels', sans-serif;
    font-weight: 600;
    font-size: 36px;
    line-height: 120%;
    color: #FFFFFF;
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
    z-index: 0;
  }

  .project-frame {
    position: relative; /* Для позиционирования Санты */
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 32px;
    gap: 77px;
    width: 1264px;
    background: #0F0F37;
    border-radius: 16px;
    flex: none;
    order: 2;
    align-self: stretch;
    flex-grow: 0;
    z-index: 2;
  }

  .santa-image {
    position: absolute;
    top: -100px; /* При необходимости отрегулировать отступ */
    left: 50%;
    transform: translateX(-50%);
    width: 200px; /* Подогнать под ваш размер */
    height: 200px; /* При необходимости */
    background: url('/images/santa.png') no-repeat center center;
    background-size: contain;
    z-index: 3;
  }

  .project-description {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 16px;
    width: 627px;
    height: auto; /* Изменено с фиксированной высоты */
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .highlight-text {
    width: 560px;
    height: auto;
    font-family: 'TT Travels', sans-serif;
    font-weight: 600;
    font-size: 24px;
    line-height: 120%;
    color: #FFFFFF;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .rules-text {
    width: 560px;
    height: auto;
    font-family: 'TT Travels', sans-serif;
    font-weight: 700;
    font-size: 18px;
    line-height: 120%;
    color: #00AB4E;
    flex: none;
    order: 1;
    flex-grow: 0;
  }

  .details-text {
    width: 627px;
    height: auto;
    font-family: 'TT Travels', sans-serif;
    font-weight: 500;
    font-size: 18px;
    line-height: 120%;
    color: #ABBAF0;
    flex: none;
    order: 1;
    flex-grow: 0;
  }

  .promo-button {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 24px 48px;
    gap: 8px;
    width: 368px;
    height: 83px;
    background: #00AB4E;
    border-radius: 16px;
    flex: none;
    order: 1;
    flex-grow: 0;
    cursor: pointer; /* Указатель при наведении */
    border: none; /* Убрать стандартный бордер кнопки */
    outline: none; /* Убрать стандартный outline кнопки */
    transition: background-color 0.3s; /* Плавное изменение цвета */
  }

  .promo-button:hover {
    background-color: #00CC00; /* Изменение цвета при наведении */
  }

  .promo-button:active {
    background-color: #009900; /* Изменение цвета при нажатии */
  }

  .promo-button-text {
    width: auto; /* Убрать фиксированную ширину */
    height: auto;
    font-family: 'TT Travels', sans-serif;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    display: flex;
    align-items: center;
    color: #FFFFFF;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 0px;
    gap: 24px;
    width: 368px;
    flex: none;
    order: 1;
    flex-grow: 0;
  }

  .lamp-text-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .image-frame {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px;
    width: auto;
    height: 64px;
    flex: none;
    order: 0;
    flex-grow: 0;
    gap: 8px;
  }

  .image {
    width: 60px;
    height: 64px;
    background-size: cover;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .image-lamp {
    background: url('/images/lampochka.png') no-repeat center center;
    background-size: contain;
  }

  .row-text {
    width: 316px;
    height: auto;
    font-family: 'TT Travels', sans-serif;
    font-weight: 500;
    font-size: 18px;
    line-height: 120%;
    color: #FFFFFF;
    flex: none;
    order: 1;
    flex-grow: 0;
  }

  @media (max-width: 768px) {
    .about-project {
      padding: 32px;
    }

    .project-frame {
      flex-direction: column;
      gap: 16px;
      height: auto;
    }

    .project-title {
      font-size: 28px;
    }

    .highlight-text {
      font-size: 20px;
    }

    .right-column {
      align-items: center;
    }

    .santa-image {
      width: 60px;
      height: 60px;
      top: -20px;
    }

    .promo-button {
      width: 80vw;
      font-size: 4vw;
    }

    .promo-button-text {
      width: auto; /* Чтобы текст не был ограничен */
      font-size: inherit;
    }
  }
</style>
