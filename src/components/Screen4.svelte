<script>
  // Логика компонента, если необходимо
</script>

<div class="about-project">
  <h2 class="project-title">О проекте</h2>
  <div class="project-frame">
    <div class="project-description">
      <p class="highlight-text">Выбирайте высокие коэффициенты, заключайте пари, получайте яркие эмоции от побед!</p>
      <p class="rules-text">Правила акции</p>
      <p class="details-text">CQ.ru совместно с букмекерской компанией «Лига Ставок» запустили новогодний проект. Делайте ставки на спортивные события с большими коэффициентами и выигрывайте топовые призы!</p>
      <div class="promo-button">
        <span class="promo-button-text">ПОЛУЧИТЬ ПРОМОКОД</span>
      </div>
    </div>
    <div class="right-column">
      <div class="image-frame">
        <div class="image"></div>
        <div class="image"></div>
      </div>
      <p class="row-text">Заключайте пари в «Лиге Ставок»</p>
      <div class="image-frame">
        <div class="image"></div>
        <div class="image"></div>
        <div class="image"></div>
      </div>
      <p class="row-text">Следите за розыгрышами призов</p>
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
    font-family: 'TT Travels';
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
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 32px;
    gap: 77px;
    width: 1264px;
    height: 520px;
    background: #0F0F37;
    border-radius: 16px;
    flex: none;
    order: 2;
    align-self: stretch;
    flex-grow: 0;
    z-index: 2;
  }

  .project-description {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 16px;
    width: 627px;
    height: 229px;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .highlight-text {
    width: 560px;
    height: 87px;
    font-family: 'TT Travels';
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
    height: 22px;
    font-family: 'TT Travels';
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
    height: 88px;
    font-family: 'TT Travels';
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
    padding: 12px 32px;
    gap: 8px;
    width: 368px;
    height: 83px;
    background: #00AB4E;
    border-radius: 16px;
    flex: none;
    order: 1;
    flex-grow: 0;
  }

  .promo-button-text {
    width: 206px;
    height: 19px;
    font-family: 'TT Travels';
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
    justify-content: center;
    align-items: flex-start;
    padding: 0px;
    gap: 24px;
    width: 368px;
    height: 306px;
    flex: none;
    order: 1;
    flex-grow: 0;
  }

  .image-frame {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px;
    width: 120px;
    height: 64px;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .image {
    width: 60px;
    height: 64px;
    background: url('/images/babubles 2.png') no-repeat center center;
    background-size: cover;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .row-text {
    width: 316px;
    height: 22px;
    font-family: 'TT Travels';
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
    }

    .project-title {
      font-size: 28px;
    }

    .highlight-text {
      font-size: 20px;
    }
  }
</style>