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
    }

    .content {
      display: flex;
      gap: 40px;
      align-items: flex-start;
      max-width: 1200px;
      margin: 0 auto;
    }

    .left-side {
      flex: 1;
    }

    .title {
      font-size: 60px;
      line-height: 1.2;
      white-space: pre-line;
      color: #ffffff;
      text-align: left;
      margin-bottom: 30px;
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
    }

    .promo-button:hover {
      background-color: #00CC00;
    }

    .tree-image {
      max-height: 100%;
      object-fit: contain;
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