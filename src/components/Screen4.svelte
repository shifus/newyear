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
        <button class="promo-button">ПОЛУЧИТЬ ПРОМОКОД</button>
      </div>
      <div class="project-steps">
        <div class="step">
          <div class="image" style="background: url('/images/lampochka.png'); width: 60px; height: 64px;"></div>
          <p class="step-text">Получите промокод</p>
        </div>
        <div class="step">
          <div class="image" style="background: url('/images/lampochka.png'); width: 60px; height: 64px;"></div>
          <div class="image" style="background: url('/images/lampochka.png'); width: 60px; height: 64px;"></div>
          <p class="step-text">Заключайте пари в «Лиге Ставок»</p>
        </div>
        <div class="step">
          <div class="image" style="background: url('/images/lampochka.png'); width: 60px; height: 64px;"></div>
          <div class="image" style="background: url('/images/lampochka.png'); width: 60px; height: 64px;"></div>
          <div class="image" style="background: url('/images/lampochka.png'); width: 60px; height: 64px;"></div>
          <p class="step-text">Следите за розыгрышами призов</p>
        </div>
      </div>
    </div>
    <div class="santa"></div>
  </div>
  
  <style>
  .about-project {
    position: relative;
    width: 1264px;
    padding: 32px;
    background: #0F0F37;
    border-radius: 16px;
  }
  
  .project-title {
    font-family: 'TT Travels';
    font-weight: 600;
    font-size: 36px;
    line-height: 43px;
    color: #FFFFFF;
  }
  
  .project-frame {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 77px;
  }
  
  .project-description {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 627px;
  }
  
  .highlight-text {
    font-family: 'TT Travels';
    font-weight: 600;
    font-size: 24px;
    line-height: 29px;
    color: #FFFFFF;
  }
  
  .rules-text {
    font-family: 'TT Travels';
    font-weight: 700;
    font-size: 18px;
    line-height: 22px;
    color: #00AB4E;
  }
  
  .details-text {
    font-family: 'TT Travels';
    font-weight: 500;
    font-size: 18px;
    line-height: 22px;
    color: #ABBAF0;
  }
  
  .promo-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px 64px;
    width: 368px;
    height: 83px;
    background: #00AB4E;
    border-radius: 16px;
    font-family: 'TT Travels';
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    color: #FFFFFF;
  }
  
  .project-steps {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 368px;
  }
  
  .step {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 8px;
  }
  
  .step-text {
    font-family: 'TT Travels';
    font-weight: 500;
    font-size: 18px;
    line-height: 22px;
    color: #FFFFFF;
  }
  
  .santa {
    position: absolute;
    width: 352px;
    height: 352px;
    left: calc(50% - 176px);
    top: calc(50% - 352px/2 - 227.5px);
    background: url('/images/santa.png') no-repeat center center;
    background-size: cover;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    .about-project {
      width: 100%;
      padding: 16px;
    }
    
    .project-frame {
      flex-direction: column;
      gap: 32px;
    }
    
    .project-description, .project-steps {
      width: 100%;
    }
    
    .promo-button {
      width: 100%;
    }
    
    .santa {
      position: relative;
      width: 100%;
      height: auto;
      left: 0;
      top: 0;
    }
  }
  </style>