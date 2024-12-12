<script>
    // Логика компонента, если необходимо
  </script>
  
  <section class="screen">
    <div class="content">
      <div class="left-side">
        <h1 class="title">
          В НОВЫЙ ГОД<br>
          С ЛИГОЙ СТАВОК
        </h1>
        <p class="description">
          Лига ставок, поздравляет всех с Новым Годом! Желает всего да побольше, особенно больше высоких выигрышных кэфов! 
          И анонсирует новый спецпроект, где больше однозначно лучше! 
          Получите уникальный промокод для участия в розыгрыше
        </p>
        <p class="description">
          Заключайте пари на высокие коэффициенты. Призы достанутся 100 обладателям самых больших выигрышных кэфов!
        </p>
        <button class="promo-button">
          Получить промокод
        </button>
      </div>
      <div class="right-side">
        <img src="/images/christmas-tree.png" alt="Новогодняя ёлка" class="tree-image">
      </div>
    </div>
  </section>
  
  <style>
    .screen {
      height: 100vh;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      padding: 20px;
      border: 2px solid purple;
      background: rgba(128, 0, 128, 0.1);
    }

    .content {
      display: flex;
      gap: 40px;
      align-items: flex-start;
      max-width: 1200px;
      margin: 0 auto;
      justify-content: space-between;
      border: 2px solid orange;
      background: rgba(255, 165, 0, 0.1);
    }

    .left-side {
      flex: 0 1 auto;
      max-width: 600px;
      border: 2px solid red;
      background: rgba(255, 0, 0, 0.1);
    }

    .title {
      font-size: 60px;
      line-height: 1.2;
      white-space: pre-line;
      color: #0ff658;
      text-align: left;
      margin-bottom: 30px;
      min-width: max-content;
      border: 2px solid blue;
      background: rgba(0, 0, 255, 0.1);
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
      margin-bottom: 30px;
      border: 2px solid green;
      background: rgba(0, 255, 0, 0.1);
    }

    .promo-button {
      background-color: #00FF00;
      color: #ffffff;
      padding: 15px 30px;
      border: 2px solid yellow !important;
      border-radius: 5px;
      font-size: 18px;
      cursor: pointer;
      transition: background-color 0.3s;
      width: 400px;
    }

    .promo-button:hover {
      background-color: #00CC00;
    }

    .tree-image {
      max-height: 70%;
      object-fit: contain;
      border: 2px solid cyan;
    }

    .right-side {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: -30px;
      margin-left: -150px;
      border: 2px solid pink;
      background: rgba(255, 192, 203, 0.1);
    }

    /* Мобильные устройства */
    @media (max-width: 768px) {
      .content {
        flex-direction: column;
        gap: 20px;
      }

      .title {
        font-size: 40px;
        margin-bottom: 20px;
      }

      .description {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .tree-image {
        width: 100%;
        height: auto;
        margin-top: 20px;
      }
    }
  </style>