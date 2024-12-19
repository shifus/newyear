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
      <a href="#" class="promo-button">ПОЛУЧИТЬ ПРОМОКОД</a>
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
    font-family: 'TT Travels';
    font-weight: 600;
    font-size: 36px;
    line-height: 43px;
    color: #FFFFFF;
    margin-bottom: 32px;
  }

  .project-frame {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
    width: 100%;
  }

  .project-description {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .highlight-text, .rules-text, .details-text {
    font-family: 'TT Travels';
  }

  .highlight-text {
    font-weight: 600;
    font-size: 24px;
    line-height: 29px;
    color: #FFFFFF;
  }

  .rules-text, .details-text {
    font-weight: 500;
    font-size: 18px;
    line-height: 22px;
    color: #ABBAF0;
  }

  .promo-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 32px;
    background: #00AB4E;
    border-radius: 16px;
    color: #FFFFFF;
    font-family: 'TT Travels';
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    text-decoration: none;
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