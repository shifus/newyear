<script>
  import Screen4 from './Screen4.svelte'; // Импортируем Screen4
  import Screen5 from './Screen5.svelte'; // Импортируем Screen5

  // Функция, вызываемая при клике на кнопку «Получить промокод»
  function handlePromoClick() {
    console.log('Кнопка "Получить промокод" нажата');
    alert('Промокод получен! Нажмите ОК, чтобы продолжить.');
  }
</script>

<div class="page-wrapper">
  <!-- Первый экран -->
  <div class="screen-container">
    <section class="first-screen">
      <picture>
        <!-- Мобильная версия -->
        <source srcset="/images/header_mob.png" media="(max-width: 768px)">
        <!-- Десктопная версия -->
        <img src="/images/header.png" alt="Header" class="header-image" />
      </picture>

      <div class="content">
        <div class="left-side">
          <h1 class="title">
            В НОВЫЙ ГОД<br>
            С ЛИГОЙ СТАВОК
          </h1>
          <p class="description">
            Лига ставок поздравляет всех с Новым Годом! Желаем всего да побольше, особенно больше высоких выигрышных кэфов!
            И анонсируем новый спецпроект, где больше однозначно лучше! 
            Получите уникальный промокод для участия в розыгрыше.
          </p>
          <p class="description">
            Заключайте пари на высокие коэффициенты. Призы достанутся 100 одателям самых больших выигрышных кэфов!
          </p>
          <!-- Кнопка с обработчиком клика -->
          <button class="promo-button" on:click={handlePromoClick}>
            Получить промокод
          </button>
        </div>
        <div class="right-side">
          <img src="/images/christmas-tree.png" alt="Новогодняя ёлка" class="tree-image">
        </div>
      </div>
    </section>
  </div>
  
  <!-- Второй экран -->
  <div class="screen-container">
    <section class="second-screen">
      <div class="main-prize">
        <div class="prize-header">
          <span class="prize-label">Главный приз</span>
        </div>
        
        <h2 class="prize-title">iPhone 14 Pro</h2>
        
        <div class="specs-container">
          <div class="specs-column">
            <div class="spec-item">
              <span class="spec-label">Объем памяти</span>
              <span class="spec-value">128 GB</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Процессор</span>
              <span class="spec-value">A16 Bionic</span>
            </div>
          </div>
          <div class="specs-column">
            <div class="spec-item">
              <span class="spec-label">Цвет</span>
              <span class="spec-value">Космический черный</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Камера</span>
              <span class="spec-value">48 МП</span>
            </div>
          </div>
        </div>
        
        <img src="/images/iphone14pro.png" alt="iPhone 14 Pro" class="prize-image">
      </div>

      <div class="additional-prizes">
        <div class="prize-card">
          <h3 class="prize-card-category">Наушники</h3>
          <h4 class="prize-card-model">Sony WH-1000XM4</h4>
          <img src="/images/Naychniki.png" alt="Sony WH-1000XM4" class="prize-card-image">
        </div>

        <div class="prize-card">
          <h3 class="prize-card-category">Винный шкаф</h3>
          <h4 class="prize-card-model">Kitfort KT-2403</h4>
          <img src="/images/wine-fridge.png" alt="Kitfort KT-2403" class="prize-card-image">
        </div>

        <div class="prize-card">
          <h3 class="prize-card-category">Фитнес трекер</h3>
          <h4 class="prize-card-model">Xiaomi Mi Band 7</h4>
          <img src="/images/mi-band.png" alt="Xiaomi Mi Band 7" class="prize-card-image">
        </div>
      </div>

      <div class="leaderboard">
        <div class="leaderboard-content">
          <div class="leaderboard-headers">
            <div class="header-place">Место</div>
            <div class="header-prize">Приз</div>
            <div class="header-freebet">Фрибет</div>
          </div>

          <div class="leaderboard-rows">
            <div class="leaderboard-row">
              <div class="place">1</div>
              <div class="prize">iPhone 14 Pro</div>
              <div class="freebet">50 000 ₽</div>
            </div>

            <div class="leaderboard-row">
              <div class="place">2</div>
              <div class="prize">Наушники Sony</div>
              <div class="freebet">40 000 ₽</div>
            </div>

            <div class="leaderboard-row">
              <div class="place">3</div>
              <div class="prize">Наушники Sony</div>
              <div class="freebet">30 000 ₽</div>
            </div>

            <div class="leaderboard-row">
              <div class="place">4</div>
              <div class="prize">Винный шкаф Kitfort</div>
              <div class="freebet">20 000 ₽</div>
            </div>

            <div class="leaderboard-row">
              <div class="place">5</div>
              <div class="prize">Винный шкаф Kitfort</div>
              <div class="freebet">10 000 ₽</div>
            </div>

            <div class="leaderboard-row">
              <div class="place">6-10</div>
              <div class="prize">Фитнес трекер Xiaomi</div>
              <div class="freebet">7 000 ₽</div>
            </div>
          </div>
        </div>

        <div class="merch-column">
          <div class="merch-content">
            <div class="merch-images">
              <!-- Здесь будут изображения мерча -->
            </div>
            <div class="merch-status">
              <span>Мерч разыгран</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  
  <!-- Добавляем Screen4 и Screen5 -->
  <div class="screen1">
    <Screen4 /> <!-- Добавляем Screen4 -->
    <Screen5 /> <!-- Добавляем Screen5 -->
  </div>
  
  <!-- Четвёртый экран (Screen4) -->
  <!-- Screen4 будет импортирован выше и отображён здесь -->
  
  <!-- Пятый экран (Screen5) -->
  <!-- Screen5 будет импортирован выше и отображён здесь -->
</div>

<section class="third-screen">
  <div class="leaderboard-container">
    <div class="leaderboard-left">
      <h2 class="leaderboard-title">Таблица конкурса</h2>
      <p class="leaderboard-description">
        100 призов достанутся участникам, с самыми большими выигрышными коэффициентами
      </p>
      <a href="#" class="previous-winners-link">Смотреть предыдущих победителей</a>
      
      <div class="leaderboard-table">
        <!-- Здесь будет таблица -->
        <div class="table-frame">
          <!-- Таблица будет добавлена позже -->
        </div>
      </div>
    </div>

    <div class="leaderboard-right">
      <div class="actions-container">
        <button class="action-button">Введите промокод</button>
        <button class="action-button">Узнать место</button>
        
        <p class="promo-description">
          Введите уникальный промокод, чтобы узнать своё место в таблице. 
          Промокод находится в личном кабинете БК «Лига Ставок» в разделе «Промокоды».
        </p>

        <div class="additional-info">
          <p>Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту</p>
          <p>Приз за первое место iPhone 14 Pro</p>
          <p>Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже</p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* Общие стили */
  * {
    box-sizing: border-box; /* Учитываем рамки и отступы в общей шине */
  }

  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden; /* Убираем горизонтальный скролл на уровне документа */
  }

  .page-wrapper, .screen-container, .first-screen, .second-screen, .third-screen {
    width: 100%;
    overflow-x: hidden; /* Убираем горизонтальный скролл на уровне контейнеров */
  }

  .page-wrapper {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 50px; /* Фиксированный отступ между экранами */
  }

  /* Первый экран */
  .first-screen {
    position: relative;
    padding: 0;
    margin-bottom: 50px; /* Фиксированный отступ между первым и вторым экраном */
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: auto; /* Устанавливаем высоту в auto */
    flex: 0 1 auto; /* Занимает только необходимое пространство */
  }

  .header-image {
    display: block;
    width: 100%;
    height: auto;
    margin: 0;
    background: rgba(128, 128, 128, 0.1);
    box-sizing: border-box;
    padding: 0;
  }

  .content {
    position: relative;
    height: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 5vw;
    align-items: flex-start;
    max-width: 100%;
    margin: 0 auto;
    justify-content: space-between;
    padding: 3vh 3vw;
    box-sizing: border-box;
    overflow: hidden;
  }

  .left-side {
    flex: 1;
    min-width: 300px;
    padding: 2vh 2vw;
    max-height: none; /* Убираем ограничение высоты */
    overflow: visible; /* Меняем overflow с hidden на visible */
  }

  .title {
    font-size: 3rem; /* Устанавливаем фиксированный размер шрифта */
    line-height: 1.2;
    white-space: pre-line;
    color: #0ff658;
    text-align: left;
    margin-bottom: 3vh;
  }

  .title br {
    margin-bottom: -1.3em;
    display: block;
    content: "";
  }

  .description {
    color: #ffffff;
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 20px;
    max-width: 800px;
  }

  .promo-button {
    background-color: #00FF00;
    color: #ffffff;
    padding: 15px 30px;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: auto;
    min-width: 200px;
    max-width: 100%;
    display: inline-block;
    text-align: center;
    margin-top: 20px;
  }

  .promo-button:hover {
    background-color: #00CC00;
  }

  .promo-button:active {
    background-color: #009900;
  }

  .tree-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
  }

  .right-side {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2vh 2vw;
    margin-right: 2vw;
    max-height: 80vh;
    overflow: hidden;
  }

  /* Второй экран */
  .second-screen {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 48px;
    background: #15154D;
    border-radius: 16px;
    align-items: center;
    gap: 32px;
    overflow-x: hidden; /* Убираем горизонтальный скролл */
  }

  .main-prize {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 32px;
    gap: 32px;
    width: 100%;
    max-width: 1296px;
    background: rgba(15, 15, 55, 0.7);
    border: 1px solid rgba(0, 255, 116, 0.2);
    backdrop-filter: blur(5px);
    border-radius: 16px;
  }

  .prize-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .prize-label {
    display: inline-flex;
    padding: 8px 16px;
    background: rgba(0, 255, 116, 0.1);
    border-radius: 24px;
    color: #00FF74;
    font-size: 16px;
    font-weight: 600;
    line-height: 140%;
  }

  .prize-title {
    font-size: 64px;
    font-weight: 700;
    line-height: 110%;
    color: #FFFFFF;
    margin: 8px 0;
  }

  .specs-container {
    display: flex;
    gap: 32px;
    margin-top: 16px;
  }

  .specs-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .spec-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .spec-label {
    font-size: 16px;
    color: #ABBAF0;
    font-weight: 500;
    line-height: 140%;
  }

  .spec-value {
    font-size: 24px;
    color: #FFFFFF;
    font-weight: 600;
    line-height: 140%;
  }

  .prize-image {
    position: absolute;
    width: 15%;
    height: auto;
    left: 70%;
    bottom: 0;
    object-fit: contain;
    z-index: 1;
  }

  .additional-prizes {
    display: flex;
    gap: 12px;
    width: 100%;
    margin-top: 32px;
  }

  .prize-card {
    flex: 1;
    padding: 32px;
    background: rgba(15, 15, 55, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .prize-card-category {
    font-size: 18px;
    font-weight: 600;
    line-height: 110%;
    color: #FFFFFF;
  }

  .prize-card-model {
    font-size: 32px;
    font-weight: 700;
    line-height: 110%;
    color: #FFFFFF;
    margin-top: 8px;
  }

  .prize-card-image {
    width: 100%;
    height: 246px;
    object-fit: contain;
  }

  .leaderboard {
    display: flex;
    flex-direction: row;
    gap: 12px;
    width: 100%;
    margin-top: 32px;
    overflow-x: hidden; /* Убираем горизонтальный скролл */
  }

  .leaderboard-content {
    flex: 1;
    max-width: 70%;
    box-sizing: border-box;
  }

  .leaderboard-headers {
    display: flex;
    padding: 0 32px;
    gap: 8px;
    margin-bottom: 16px;
  }

  .header-place,
  .header-prize,
  .header-freebet {
    font-family: 'TT Travels';
    font-size: 24px;
    line-height: 120%;
    color: #ABBAF0;
  }

  .header-place {
    width: 170px;
  }

  .header-prize {
    flex: 1;
  }

  .header-freebet {
    width: 200px;
    text-align: right;
  }

  .leaderboard-rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .leaderboard-row {
    display: flex;
    padding: 32px;
    gap: 8px;
    background: #0F0F37;
    border-radius: 16px;
    align-items: center;
  }

  .place,
  .prize,
  .freebet {
    font-family: 'TT Travels';
    font-size: 32px;
    line-height: 120%;
    color: #FFFFFF;
  }

  .place {
    width: 170px;
  }

  .prize {
    flex: 1;
  }

  .freebet {
    width: 200px;
    text-align: right;
    color: #ABBAF0;
  }

  .merch-column {
    flex: 0 0 30%;
    background: #0F0F37;
    border-radius: 16px;
    padding: 32px;
    box-sizing: border-box;
  }

  .merch-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 140px;
    gap: 16px;
  }

  .merch-status {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 0px 16px 8px;
    gap: 8px;
    background: #00AB4E;
    border-radius: 100px;
    width: 100%;
  }

  .merch-status span {
    font-family: 'TT Travels';
    font-weight: 700;
    font-size: 32px;
    line-height: 120%;
    color: #FFFFFF;
  }

  /* Третий экран */
  .third-screen {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3vw;
    background: linear-gradient(180deg, #0F0F37 0%, #1A1A4F 100%);
    overflow-x: hidden; /* Убираем горизонтальный скролл */
  }

  .leaderboard-container {
    display: flex;
    gap: 3vw;
    max-width: 95vw;
    width: 100%;
    align-items: flex-start;
    margin: 0 auto;
  }

  .leaderboard-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2vh;
  }

  .leaderboard-title {
    font-size: 3.2vw;
    margin-bottom: 1.5vh;
    color: #ffffff;
  }

  .leaderboard-description {
    font-size: 1.6vw;
    margin-bottom: 2vh;
    color: #a20b9a;
    line-height: 1.4;
    opacity: 0.9;
    max-width: 90%;
  }

  .previous-winners-link {
    font-size: 1.6vw;
    margin-bottom: 2vh;
    display: inline-block;
    padding: 0.5vh 1vw;
    color: #00AB4E;
    text-decoration: none;
  }

  .leaderboard-table {
    /* Добавьте стили для таблицы, если необходимо */
  }

  .table-frame {
    padding: 2.5vw;
    gap: 1.5vw;
    width: 50vw;
    min-height: 55vh;
    background: rgba(15, 15, 55, 0.7);
    border-radius: 1.5vw;
    box-shadow: 0 0 2vw rgba(0, 0, 0, 0.2);
  }

  .leaderboard-right {
    width: 20vw;
    position: sticky;
    top: 2vh;
  }

  .actions-container {
    display: flex;
    flex-direction: column;
    gap: 1.5vh;
  }

  .action-button {
    width: 100%;
    padding: 1.2vh 1.5vw;
    font-size: 1.6vw;
    cursor: pointer;
    background-color: #00AB4E;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  .action-button:hover {
    background-color: #00CC00;
  }

  .promo-description {
    font-size: 1.3vw;
    margin-bottom: 2vh;
    color: #ffffff;
  }

  .additional-info {
    padding: 2vw;
    background: rgba(15, 15, 55, 0.6);
    border-radius: 1vw;
  }

  .additional-info p {
    font-size: 1.1vw;
    margin-bottom: 1vh;
    color: #ffffff;
  }

  /* Адаптивные стили */
  @media (max-width: 768px) {
    .title, .description, .promo-button {
      text-align: left;
    }

    .content {
      flex-direction: column;
      gap: 20px;
      max-width: 100%;
      margin: 0;
      padding: 20px;
    }

    .left-side {
      max-width: 90%;
      margin: 0 auto;
      padding: 0;
    }

    .right-side {
      width: 100%;
      margin-top: 0vh;
    }

    .header-image {
      width: 100%;
      margin: 0;
      border: none;
      background: none;
    }

    .title {
      font-size: 8vw;
      margin-bottom: 20px;
      text-align: center;
    }

    .description {
      font-size: 16px;
      margin-bottom: 15px;
      padding: 0 10px;
      text-align: left;
    }

    .promo-button {
      width: calc(100% - 40px);
      max-width: 280px;
      font-size: 16px;
      padding: 12px 20px;
      margin: 15px auto;
    }

    .tree-image {
      width: 100%;
      height: auto;
      margin-top: 0;
    }

    .leaderboard-container {
      flex-direction: column;
      gap: 2vh;
      max-width: 85vw;
    }

    .table-frame {
      width: 100%;
      height: auto;
    }

    .leaderboard-right {
      width: 100%;
      position: static;
    }

    .leaderboard-title {
      font-size: 48px;
    }

    .leaderboard-description {
      font-size: 24px;
    }

    .action-button {
      font-size: 24px;
    }

    .promo-description {
      font-size: 18px;
    }

    .additional-info p {
      font-size: 16px;
    }

    .left-side {
      min-width: unset;
      width: 100%;
      padding: 20px;
      overflow: visible;
      max-height: none;
    }

    .content {
      padding: 20px;
    }

    .promo-button {
      position: relative;
      z-index: 2;
    }
  }

  /* Добавляем промежуточную точку для планшетов */
  @media (min-width: 769px) and (max-width: 1024px) {
    .description {
      font-size: 16px;
      max-width: 600px;
    }

    .promo-button {
      font-size: 16px;
      padding: 12px 25px;
      min-width: 180px;
    }

    .left-side {
      padding: 20px;
      min-width: 300px;
    }
  }

  @media (min-width: 1025px) {
    .description {
      font-size: 18px;
    }

    .left-side {
      max-width: 60%;
    }
  }
</style>
