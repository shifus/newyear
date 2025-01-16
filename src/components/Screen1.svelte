<script>
  import Screen4 from './Screen4.svelte';
  import Screen5 from './Screen5.svelte';

  // Функция, вызыаемая при клеке на кнопку «Получить промокод»
  function handlePromoClick() {
    console.log('Кнопка "Получить промокод" нажата');
    alert('Промокод получен! Нажмите ОК, чтобы продолжить.');
  }

  // Функция для обработки ввода промокода
  function handlePromoCodeInput() {
    alert('Вы успешно ввели промокод!');
  }

  // Функция для обработки проверки места
  function handleCheckPlace() {
    alert('Вот ваше место');
  }

  // Добавим плавный скролл для всех внутренних ссылок
  function handleScroll(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
</script>

<div class="page-wrapper">
  <!-- Стартовая страница -->
  <div class="screen-container">
    <section class="first-screen">
      <div class="header">
        <div class="logo-container">
          <img src="/images/Ligalogo.png" alt="Логотип" class="logo" />
          <div class="candy-cane"></div>
        </div>
        <div class="menu">
          <a href="#leaderboard-table" class="menu-item">Таблица участников</a>
          <a href="#about-project" class="menu-item">О проекте</a>
          <a href="#prizes" class="menu-item">Призы</a>
        </div>
      </div>
      <div class="header-mobile">
        <img src="/images/header_mob.png" alt="Мобильный заголовок" class="header-mobile-image" />
      </div>

      <!-- ПК версия -->
      <div class="content desktop-version">
        <div class="left-side">
          <h1 class="title">
            <span class="first-line">В НОВЫЙ ГОД</span>
            <span class="second-line">С ЛИГОЙ СТАВОК</span>
          </h1>
          <div class="description-container">
            <p class="description">
              <span class="description-line">Лига ставок, поздравляет всех с Новым Годом!</span>
              <span class="description-line">Желает всего да побольше, особенно больше высоких выигрышных кэфов!</span>
              <span class="description-line">И анонсирует новый спецпроект, где больше однозначно лучше!</span>
              <span class="description-line">Получите уникальный промокод для участия в розыгрыше.</span>
            </p>
            
            <p class="description description-secondary">
              <span class="description-line">Заключайте пари на высокие коэффициенты.</span>
              <span class="description-line">Призы достанутся 100 обладателям самых больших</span>
              <span class="description-line">выигрышных кэфов!</span>
            </p>
          </div>
          <div class="promo-container">
            <button class="promo-button" on:click={handlePromoClick}>
              Получить промокод
            </button>
            <img src="/images/santa.png" alt="Санта" class="santa-image" />
          </div>
        </div>
        
        <div class="right-side">
          <div class="tree-container">
            <img src="/images/christmas-tree.png" alt="Ёлка" class="tree-image" />
            <img src="/images/Подарки.png" alt="Подарки" class="gifts-image" />
            <img src="/images/zvezda_1.png" alt="Звезда 1" class="star star-1" />
            <img src="/images/zvezda_2.png" alt="Звезда 2" class="star star-2" />
            <img src="/images/zvezda_3.png" alt="Звезда 3" class="star star-3" />
          </div>
        </div>
      </div>

      <!-- Мобильная версия -->
      <div class="content mobile-container">
        <div class="left-side">
          <h1 class="title">
            <span class="first-line">В НОВЫЙ ГОД</span>
            <span class="second-line">С ЛИГОЙ СТАВОК</span>
          </h1>
          <div class="description-container">
            <p class="description">
              <span class="description-line">Лига ставок, поздравляет всех с Новым Годом!</span>
              <span class="description-line">Желает всего да побольше, особенно больше высоких выигрышных кэфов!</span>
              <span class="description-line">И анонсирует новый спецпроект, где больше однозначно лучше!</span>
              <span class="description-line">Получите уникальный промокод для участия в розыгрыше.</span>
            </p>
            
            <p class="description description-secondary">
              <span class="description-line">Заключайте пари на высокие коэффициенты.</span>
              <span class="description-line">Призы достанутся 100 обладателям самых больших</span>
              <span class="description-line">выигрышных кэфов!</span>
            </p>
          </div>
          <div class="promo-container">
            <button class="promo-button" on:click={handlePromoClick}>
              ПОЛУЧИТЬ ПРОМОКОД
            </button>
            <img src="/images/santa.png" alt="Санта" class="santa-image" />
          </div>
        </div>
        
        <div class="right-side">
          <div class="tree-container">
            <img src="/images/christmas-tree.png" alt="Ёлка" class="tree-image" />
            <img src="/images/Подарки.png" alt="Подарки" class="gifts-image" />
            <img src="/images/zvezda_1.png" alt="Звезда 1" class="star star-1" />
            <img src="/images/zvezda_2.png" alt="Звезда 2" class="star star-2" />
            <img src="/images/zvezda_3.png" alt="Звезда 3" class="star star-3" />
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Призы конкурса -->
  <div class="screen-container">
    <section class="second-screen" id="prizes">
      <div class="main-prize" style="position: relative;">
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
        <img src="/images/gift.png" class="gift-decoration" alt="gift" style="position: absolute; top: -80px; right: -50px; width: 180px; height: auto; z-index: -1; mix-blend-mode: multiply;">
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
              <img src="/images/Merch.png" alt="Мерч" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Таблица конкурса -->
  <section class="third-screen" id="leaderboard-table">
    <div class="leaderboard-container">
      <div class="leaderboard-left">
        <div class="table-frame">
          <!-- Заголовок конкурса -->
          <div class="contest-title">Таблица конкурса</div>
          <div class="contest-description">100 призов достанутся участникам, с самыми большими выигрышными коэффициентами</div>
          <a href="#" class="previous-winners-link">Смотреть предыдущих победителей</a>

          <!-- Заголовки -->
          <div class="table-headers">
            <div class="header-left">Имя</div>
            <div class="header-right">Коэффициент</div>
          </div>

          <!-- Строки таблицы -->
          <div class="table-rows">
            <div class="table-row">
              <div class="left-column">
                <div class="name">1. Михаил</div>
                <div class="phone">+7 (999) *** ** 32</div>
              </div>
              <div class="right-column">
                <div class="coefficient">10.65</div>
              </div>
            </div>
            <div class="table-row">
              <div class="left-column">
                <div class="name">2. Александр</div>
                <div class="phone">+7 (999) *** ** 45</div>
              </div>
              <div class="right-column">
                <div class="coefficient">9.87</div>
              </div>
            </div>
            <div class="table-row">
              <div class="left-column">
                <div class="name">3. Дмитрий</div>
                <div class="phone">+7 (999) *** ** 78</div>
              </div>
              <div class="right-column">
                <div class="coefficient">9.54</div>
              </div>
            </div>
            <div class="table-row">
              <div class="left-column">
                <div class="name">4. Иван</div>
                <div class="phone">+7 (999) *** ** 91</div>
              </div>
              <div class="right-column">
                <div class="coefficient">9.21</div>
              </div>
            </div>
            <div class="table-row">
              <div class="left-column">
                <div class="name">5. Сергей</div>
                <div class="phone">+7 (999) *** ** 23</div>
              </div>
              <div class="right-column">
                <div class="coefficient">8.95</div>
              </div>
            </div>
            <div class="table-row">
              <div class="left-column">
                <div class="name">6. Андрей</div>
                <div class="phone">+7 (999) *** ** 67</div>
              </div>
              <div class="right-column">
                <div class="coefficient">8.76</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="leaderboard-right">
        <div class="actions-container actions-container-mobile" style="margin-top: 190px;">
          <button class="action-button" on:click={handlePromoCodeInput}>Введите промокод</button>
          <button class="action-button" on:click={handleCheckPlace}>Узнать место</button>
          
          <p class="promo-description">
            Введите уникальный промокод, чтобы узнать своё место в таблице. 
            Промокод находится в личном кабинете БК «ига Ставок» разделе «Промокоды».
          </p>

          <div class="additional-info">
            <p>-Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту</p>
            <p>-Приз за первое место iPhone 14 Pro</p>
            <p>-Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- О проекте -->
  <section id="about-project">
    <Screen4 />
  </section>

  <!-- Расписание стримов -->
  <Screen5 />
</div>

<style>
  /* Общие стили */
  * {
    box-sizing: border-box; /* Учитываем рамки и отступы в общей ширине */
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
   
    gap: 50px; /* Фиксированный отступ между экранами */
  }

  /* Первый экран */
  .first-screen {
    position: relative;
    padding: 0;
    margin-bottom: 0px; /* Фиксированный отступ между первым и вторым экраном */
    overflow: hidden;
    flex-direction: column;
    height: auto; /* Устанавливаем высоту в auto */
    flex: 0 1 auto; /* Занимает только необходимое пространство */
    margin: 0; /* Убираем лишний отступ */
  }

  .header-image {
    position: relative;
    display: block;
    width: 100%;
    height: auto;
    margin: 0;
    background: #00ff22;
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
    font-family: 'TT Travels', sans-serif;
    font-size: calc(24px + 2vw) !important;
    line-height: 1.1;
    color: #00AB4E;
    text-align: left;
    margin-bottom: calc(30px + 1.5vw);
    white-space: normal;
  }

  .title .first-line,
  .title .second-line {
    display: block; /* Каждая строка будет с новой строки */
    white-space: nowrap; /* Запрещаем перенос внутри строки */
  }

  .title br {
    margin-bottom: -1.3em;
    display: block;
    content: "";
  }

  .description-container {
    margin-bottom: 20px;
  }

  .description {
    font-family: 'TT Travels', sans-serif;
    color: #ffffff;
    font-size: calc(1px + 1.1vw) !important;
    font-weight: 500;
    line-height: 26px;
    margin-bottom: 20px;
    max-width: 777.5px;
    display: flex;
    flex-direction: column;
    gap: calc(4px + 1vw);
  }

  .description-line {
    display: block;
    white-space: nowrap;
    width: 100%;
    line-height: 0.3;
  }

  p.description.description-secondary {
    margin-top: calc(23px + 1.5vw) !important; /* Регулируем отступ между блоками описания */
  }

  @media (max-width: 768px) {
    .description {
      font-size: 16px;
      padding: 0 10px;
      gap: 12px;
      display: block;
    }

    .description-line {
      display: inline;
      white-space: normal;
      width: auto;
      line-height: 1.4;
    }

    p.description.description-secondary {
      margin-top: 40px !important;
      display: block;
    }

    .desktop-version {
      display: none;
    }

    .mobile-container {
      display: block;
    }
  }

  .promo-button {
    font-family: 'TT Travels', sans-serif;
    background-color: #00AB4E;
    color: #ffffff;
    padding: 25px 100px;
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
    z-index: 10;
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
    transform: translateX(15%);
    z-index: 1;
  }

  .gifts-image {
    position: absolute; /* Устанавливаем абсолютное позиционирование для подарков */
    bottom: 10px; /* Смещаем изображение подарков вниз */
    right: 10px; /* Смещаем изображение подарков вправо */
    width: 50px; /* Устанавливаем ширину подарков */
    height: auto; /* Автоматически рассчитываем высоту */
  }

  .right-side {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2vh 2vw;
    margin-right: 5vw;
    max-height: 80vh;
    overflow: hidden;
    margin-top: 50px;
    position: relative;
    left: 1%;
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
    font-family: 'TT Travels', sans-serif;
    font-weight: 600; /* SemiBold */
    font-size: 16px;
    line-height: 140%;
    color: #00FF74;
  }

  .prize-title {
    font-family: 'TT Travels', sans-serif;
    font-weight: 800; /* ExtraBold */
    font-size: 64px;
    line-height: 110%;
    color: #FFFFFF;
  }

  .specs-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
  }

  .specs-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .spec-item {
    flex: 1 1 45%;
    min-width: 150px;
  }

  .spec-label {
    font-family: 'TT Travels', sans-serif;
    font-weight: 500; /* Medium */
    font-size: 16px;
    color: #ABBAF0;
    line-height: 140%;
  }

  .spec-value {
    font-family: 'TT Travels', sans-serif;
    font-weight: 600; /* SemiBold */
    font-size: 24px;
    color: #FFFFFF;
    line-height: 140%;
  }

  .prize-image {
    position: absolute;
    width: 200px;
    height: 225px;
    left: calc(50% - 80px/2 + 230px);
    bottom: 3.5px;
    background: linear-gradient(180deg, rgba(15, 15, 55, 0) 44.17%, rgba(15, 15, 55, 0.85) 100%), url('/path/to/your/image.png');
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
    font-family: 'TT Travels', sans-serif;
    font-size: 18px;
    font-weight: 600; /* SemiBold как в спецификациях */
    line-height: 110%;
    color: #FFFFFF;
  }

  .prize-card-model {
    font-family: 'TT Travels', sans-serif;
    font-size: 32px;
    font-weight: 700; /* Bold начертание */
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
    font-family: 'TT Travels', sans-serif;
    font-size: 24px;
    font-weight: 400; /* Regular начертание */
    line-height: 120%;
    color: #ABBAF0;
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
    display: flex;
    justify-content: center; /* Центрируем содержимое */
    transform: translateX(-3%); /* Сдвигаем на 20% влево */
  }

  .leaderboard-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    gap: 20px;
  }

  .leaderboard-left {
    flex: 0 0 65%;
    max-width: 904px;
  }

  .leaderboard-right {
    flex: 0 0 30%;
    padding-left: 10px;
  }

  @media (max-width: 768px) {
    .leaderboard-container {
      flex-direction: column;
      align-items: center;
      padding: 0 20px;
    }

    .leaderboard-left {
      flex: none;
      width: 100%;
      max-width: 100%;
    }

    .leaderboard-right {
      flex: none;
      width: 100%;
      max-width: 400px;
      margin-top: 20px;
    }
  }

  .actions-container {
    position: sticky; /* Делаем контейнер липким */
    top: 190px; /* Фиксированное расстояние от верха */
    width: 400px; /* Фиксированная ширина */
    min-width: 400px; /* Минимальная ширина */
    padding: 20px;
    background: #15154D; /* Добавляем фон */
    border-radius: 16px;
    z-index: 10;
  }

  .action-button {
    width: 100%;
    min-height: 50px;
    margin-bottom: 10px;
    font-family: 'TT Travels', sans-serif;
    font-weight: 400;
    font-size: 14px;
    white-space: nowrap;
    background: transparent;
    border: 2px solid #00AB4E;
    color: #FFFFFF;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
  }

  .action-button:hover {
    background: rgba(0, 171, 78, 0.1); /* Лёгкий зелёный фон при наведении */
  }

  .promo-description {
    font-size: 16px; /* Фиксированный размер шрифта */
    line-height: 1.4;
    margin: 15px 0;
    width: 100%;
  }

  .additional-info {
    width: 100%;
  }

  .additional-info p {
    font-size: 14px; /* Фиксированный размер шрифта */
    line-height: 1.4;
    margin-bottom: 10px;
    white-space: normal; /* Разрешаем перенос текста в информационном блоке */
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
    color: #00AB4E;
    text-decoration: none;
  }

  .leaderboard-table {
    /* Добавьте стили ля таблицы, если необходимо */
  }

  .table-frame {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    width: 904px;
    height: 533px;
    background: #0F0F37;
    border-radius: 16px;
  }

  .table-headers {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 16px;
  }

  .header-left, .header-right {
    font-family: 'TT Travels';
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 29px;
    color: #FFFFFF;
  }

  .table-rows {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex-grow: 1;
    font-family: 'TT Travels', sans-serif;
    font-weight: 400;
    font-size: 24px;
    line-height: 120%;
    color: #FFFFFF;
    gap: 12px;
  }

  .table-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 52px;
    padding: 0 8px; /* Отступы по бокам */
    flex-grow: 1; /* Позволяет строкам занимать доступное пространство */
  }

  .left-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .right-column {
    display: flex;
    align-items: center;
    justify-content: flex-end; /* Выровнять по правому краю */
  }

  .name, .phone, .coefficient {
    color: #FFFFFF; /* Белый цвет текста */
  }

  .leaderboard-right {
    width: 20vw;
    position: sticky;
    top: 2vh;
  }

  .actions-container {
    display: flex;
    flex-direction: column;
    gap: 8px; /* Уменьшаем отступы между элементами */
  }

  .promo-description, .additional-info p {
    color: #FFFFFF; /* Белый цвет текста */
  }

  /* Новый стиль для кнопки "Узнать место" */
  .action-button:nth-child(2) {
    background: #00AB4E;
    color: #FFFFFF;
  }

  .action-button:nth-child(2):hover {
    background: #009544; /* Немного темнее при наведении */
  }

  @media (max-width: 768px) {
    .actions-container-mobile {
      margin-top: 0 !important;
    }
  }

  @media (max-width: 768px) {
    .actions-container {
      transform: translateX(0); /* Убираем смещение влево */
      width: 90%; /* Немного уменьшаем ширину */
      min-width: auto;
      margin-right: auto;
      margin-left: auto;
      overflow: hidden;
    }

    .actions-container-mobile {
      margin-top: 0 !important;
    }
  }

  .menu-item {
    cursor: pointer;
    text-decoration: none; /* Убираем подчеркивание у ссылок */
    color: inherit;
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
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .header-image {
      width: 100%;
      margin: 0;
      border: none;
      background: none;
    }

    .title {
      font-size: calc(20px + 2vw) !important;
      margin-top: calc(20px + 1.5vw);
      margin-bottom: calc(25px + 1.5vw);
    }

    .title .first-line,
    .title .second-line {
      display: block;
      white-space: nowrap;
    }

    .description {
      font-size: calc(14px + 1vw) !important;
      line-height: 1.4;
      gap: calc(6px + 0.8vw);
      max-width: 100%;
    }

    .promo-button {
      width: 110%;
      max-width: none;
      margin: 15px auto;
      padding: 15px 20px;
      display: block;
      text-align: center;
    }

    .promo-container {
      display: flex;
      justify-content: center;
      width: 100%;
      position: relative;
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

    .main-prize {
        flex-direction: column;
        align-items: center;
        padding: 16px;
        gap: 16px;
    }

    .specs-container {
        flex-direction: column;
        align-items: center;
    }

    .prize-image {
        position: static;
        width: 50%;
        margin: 0 auto;
    }

    .additional-prizes {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    }

    .prize-card {
        width: 100%;
        max-width: none;
        margin: 0 auto;
    }

    .leaderboard {
        flex-direction: column;
        gap: 16px;
        width: 100%;
    }

    .leaderboard-content, .merch-column {
        width: 100%;
        max-width: none;
        margin: 0 auto;
    }

    .leaderboard-rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .leaderboard-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        gap: 8px;
        width: 100%;
    }


    .menu {
      justify-content: center;
      width: 100%;
      background: #15154D;
      padding: 8px 0;
      border-radius: 16px;
    }

    .menu-item {
      font-size: calc(14px + 0.5vw);
    }

    .first-screen {
      margin-top: 00px; /* Увеличиваем отступ сверху для первого экрана */
      padding-top: 20px; /* Добавляем внутренний отступ сверху */
    }

    .title {
      margin-top: 32px; /* Добавляем отступ сверху для заголовка */
      margin-bottom: 32px;
      margin-left: 6px;
    }

    .additional-prizes {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .prize-card {
      width: 100%;
      max-width: none;
      margin: 0 auto;
    }

    .leaderboard-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      gap: 8px;
      width: 100%;
    }

    .place,
    .prize,
    .freebet {
      font-size: 16px;
      text-align: center;
    }
  }

  /* Добавляем помежуточную точку ля планшетов */
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

  picture {
    position: relative;
    display: block;
  }

  .candy-cane {
    width: 50px;
    height: 50px;
    margin-left: 10px;
    background: url('/images/Trost.png') no-repeat center center;
    background-size: contain;
    transform: rotate(30deg);
    position: relative;
    top: -20px;
  }

  @media (max-width: 768px) {
    .candy-cane {
        display: none;
    }
  }

  .header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
    gap: 20px;

    position: sticky;
    top: 0;
    height: 40px;
    background: #1A1A4F;
    border-radius: 16px;
    z-index: 1000;
    margin-top: 30px;
  }

  .header-mobile {
    display: none; /* Скрываем на десктопной версии */
  }

  .header-mobile-image {
    width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    .header {
      display: none; /* Скрываем на мобильной версии */
    }

    .header-mobile {
      display: block; /* Показываем на мобильной версии */
      position: sticky; /* Позиционирование, чтобы оставаться на месте */
      top: -780px;
      left: 0;
      width: 100%;
      z-index: 1000; /* Убедитесь, что элемент находится поверх других */
      background-color: #1A1A4F; /* Убедитесь, что фон установлен */
      margin: -10px 0 30px 0; /* Добавьте отступ снизу */
      padding: 0; /* Убедитесь, что нет отступов */
    }

    /* Убедитесь, что контент не перекрывает header-mobile */
    .content {
      margin-top: 50px; /* Отрегулируйте отступ, чтобы контент не перекрывал фиксированный хедер */
    }
  }

  .logo-container {
    display: flex;
    align-items: center;
  }

  .logo {
    width: 100px;
    height: auto;
  }

  .candy-cane {
    width: 130px;
    height: 130px;
    margin-left: -50px;
    background: url('/images/Trost.png') no-repeat center center;
    background-size: contain;
    transform: rotate(0deg);
    position: relative;
    top: 18px;
  }

  .menu {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    gap: 24px;
    position: absolute;
    top: 50%;
    right: 100px;
    transform: translateY(-50%);
    z-index: 1001;
    background: transparent;
  }

  .menu-item {
    font-family: 'TT Travels', sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 22px;
    display: flex;
    align-items: center;
    color: #FFFFFF;
    white-space: nowrap;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .menu {
      position: absolute;
      top: 50%;
      right: 50px;
      justify-content: center;
      width: auto;
      padding: 8px 16px;
      border-radius: 16px;
    }

    .menu-item {
      font-size: 14px;
    }
  }

  .menu-item:nth-child(1) {
    width: 199px;
  }

  .menu-item:nth-child(2) {
    width: 101px;
  }

  .menu-item:nth-child(3) {
    width: 65px;
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 8px 16px;
      gap: 16px;
      left: 0;
      top: 0;
    }

    .menu {
      justify-content: center;
      width: 100%;
    }

    .menu-item {
      font-size: 16px;
    }
  }

  .promo-container {
    position: relative;
    display: inline-block;
    margin-top: calc(1px + 1.1vw); /* Увеличиваем отступ, чтобы сдвинуть весь контейнер вниз */
  }

  .santa-image {
    position: absolute;
    top: -30px;
    right: 10px;
    width: 70px;
    height: auto;
    z-index: 1;
  }

  .promo-button {
    position: relative;
    z-index: 10;
  }

  .tree-container {
    position: relative;
    z-index: 1;
  }

  .tree-image {
    position: relative;
    z-index: 1;
  }

  .gifts-image {
    position: absolute; /* Устанавливаем абсолютное позиционирование для подарков */
    bottom: 10px; /* Смещаем изображение подарков вниз */
    right: 10px; /* Смещаем изображение подарков вправо */
    width: 150px; /* Устанавливаем ширину подарков */
    height: auto; /* Автоматически рассчитываем высоту */
  }

  .star {
    position: absolute;
    height: auto;
    z-index: 999;
    pointer-events: none;
  }

  .star-1 {
    top: 70px;
    left: 120px;
    width: 25px;
    z-index: 999;
  }

  .star-2 {
    top: 180px;
    left: 180px;
    width: 8px;
    z-index: 999;
  }

  .star-3 {
    top: 250px;
    left: 130px;
    width: 15px;
    z-index: 999;
  }

  .mobile-container {
    display: none; /* Скрываем на десктопе */
  }

  /* Медиа-запрос для мобильных устройств */
  @media (max-width: 768px) {
    .mobile-container {
      display: block;
      position: relative;
      width: 320px;
      margin: 0 auto;
      background: #15154D; /* Яркий красный фон для тестирования */
      border-radius: 16px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: 0 0 10px rgba(0, 255, 116, 0.2);
      z-index: 1;
    }

    .content {
      justify-content: center;
    }

    /* Убираем стандартные отступы внутри контейнера */
    .left-side,
    .right-side {
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .right-side {
        width: 100%;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .tree-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        position: relative;
    }

    .tree-image {
        transform: none;
        max-width: 100%;
        margin: 0 auto;
        width: 500px;
        height: auto;
    }
  }

  /* Убедимся, что контейнер не перекрывается другими элементами */
  .left-side .mobile-container,
  .right-side .mobile-container {
    z-index: 1;
    margin-bottom: 20px;
  }

  /* Стили для ПК версии */
  .desktop-version {
    display: flex;
  }

  /* Стили для мобильной версии */
  .mobile-container {
    display: none;
    background: #15154D;
    border-radius: 16px;
    box-shadow: 0 0 10px rgba(0, 255, 116, 0.2);
    padding: 20px;
    box-sizing: border-box;
  }

  /* Медиа-запрос для мобильных устройств */
  @media (max-width: 768px) {
    .desktop-version {
      display: none;
    }

    .mobile-container {
      display: block;
      width: 320px;
      margin: 0 auto;
    }
  }

  .description-secondary {
    margin-top: 20px; /* Добавляем отступ сверху */
  }

  @media (max-width: 768px) {
    .star-1 {
        top: 70px;
        left: 20px;
        width: 25px;
    }

    .star-2 {
        top: 180px;
        left: 60px;
        width: 8px;
    }

    .star-3 {
        top: 250px;
        left: 10px;
        width: 15px;
    }
}

  @media (max-width: 768px) {
    .content.mobile-container {
      width: 100vw; /* Растягиваем на всю ширину viewport */
      max-width: 100vw;
      margin: 0;
      padding: 5vw;
      box-sizing: border-box;
      overflow-x: hidden; /* Предотвращаем горизонтальный скролл */
    }
    
    /* ... остальные стили остаются без изменений ... */
  }

  @media (max-width: 768px) {
    .gift-decoration {
      width: 90px !important; /* Уменьшаем в два раза */
      top: -40px !important; /* Также корректируем позицию */
      right: -25px !important;
    }
  }

  .contest-title {
    width: 1136px;
    height: 43px;
    font-family: 'TT Travels';
    font-style: normal;
    font-weight: 600;
    font-size: 36px;
    line-height: 120%;
    color: #FFFFFF;
    margin-bottom: 8px; /* Отступ снизу */
  }

  .contest-description {
    width: 560px;
    height: 29px;
    font-family: 'TT Travels';
    font-style: normal;
    font-weight: 400;
    font-size: 24px;
    line-height: 120%;
    color: #ABBAF0;
    margin-bottom: 8px;
  }

  @media (max-width: 768px) {
    .contest-description {
      width: 100%;
      max-width: 320px;
      height: auto;
      white-space: normal;
      word-wrap: break-word;
      overflow: visible;
      margin: 0 auto;
    }
  }

  .previous-winners-link {
    width: 368px;
    height: 22px;
    font-family: 'TT Travels';
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 120%;
    color: #00AB4E;
    text-decoration: none; /* Убираем подчеркивание */
    margin-bottom: 16px; /* Отступ снизу */
  }

  .actions-container {
    display: flex;
    flex-direction: column;
    gap: 8px; /* Уменьшаем отступы между элементами */
  }

  .promo-description, .additional-info p {
    color: #FFFFFF; /* Белый цвет текста */
  }

  /* Новый стиль для кнопки "Узнать место" */
  .action-button:nth-child(2) {
    background: #00AB4E;
    color: #FFFFFF;
  }

  .action-button:nth-child(2):hover {
    background: #009544; /* Немного темнее при наведении */
  }

  @media (max-width: 768px) {
    .actions-container-mobile {
      margin-top: 0 !important;
    }
  }

  @media (max-width: 768px) {
    .actions-container {
      transform: translateX(0); /* Убираем смещение влево */
      width: 90%; /* Немного уменьшаем ширину */
      min-width: auto;
      margin-right: auto;
      margin-left: auto;
      overflow: hidden;
    }

    .actions-container-mobile {
      margin-top: 0 !important;
    }
  }

  @media (max-width: 768px) {
    #about-project .about-project.svelte-pzasak {
      padding: 32px !important;
      gap: 16px !important;
      width: 60vw !important;
      max-width: 60vw !important;
      margin: 0 auto !important;
      transform: scale(0.7) translateX(20%) !important;
    }
  }

  @font-face {
    font-family: 'TT Travels';
    src: url('/fonts/tttravels-extrabold.woff2') format('woff2'),
         url('/fonts/tttravels-extrabold.woff') format('woff');
    font-weight: 800;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'TT Travels';
    src: url('/fonts/tttravels-bold.woff2') format('woff2'),
         url('/fonts/tttravels-bold.woff') format('woff');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}

  @font-face {
    font-family: 'TT Travels';
    src: url('/fonts/tttravels-medium.woff2') format('woff2'),
         url('/fonts/tttravels-medium.woff') format('woff');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

  @font-face {
    font-family: 'TT Travels';
    src: url('/fonts/tttravels-regular.woff2') format('woff2'),
         url('/fonts/tttravels-regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

  @font-face {
    font-family: 'TT Travels';
    src: url('/fonts/tttravels-light.woff2') format('woff2'),
         url('/fonts/tttravels-light.woff') format('woff');
    font-weight: 300;
    font-style: normal;
    font-display: swap;
}

  .leaderboard-row .place,
  .leaderboard-row .prize,
  .leaderboard-row .freebet {
    font-family: 'TT Travels', sans-serif;
    font-weight: 500; /* Medium начертание */
    color: #FFFFFF;
  }

  .leaderboard-row .freebet {
    font-family: 'TT Travels', sans-serif;
    font-weight: 500;
    color: #ABBAF0; /* Меняем цвет на голубой */
  }

  @media (max-width: 768px) {
    .table-frame {
        width: 100%;
        padding: 16px;
        margin: 0;
        transform: none;
    }

    .leaderboard-container {
        width: 100%;
        padding: 0 16px;
        transform: none;
    }

    .leaderboard-left {
        width: 100%;
        max-width: 100%;
    }

    .leaderboard-row {
        padding: 8px;
        width: 100%;
    }

    .leaderboard-headers,
    .table-rows {
        width: 100%;
    }

    .left-column,
    .right-column {
        font-size: 14px;
    }
  }

  @media (max-width: 768px) {
    .contest-title {
        font-family: 'TT Travels', sans-serif;
        font-size: 24px;
        line-height: 1.2;
        color: #FFFFFF;
    }
  }

  .table-row .phone {
    font-family: 'TT Travels', sans-serif;
    font-weight: 500;
    color: #ABBAF0;
  }

</style>
