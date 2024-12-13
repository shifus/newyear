<script>
    // Логика компонента, если необходимо
  </script>
  
  <section class="screen">

      <img src="/images/header.png" alt="Header" class="header-image" />

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
  display: flex;
  flex-direction: column;
  align-items: stretch; /* чтобы дочерние элементы могли занимать всю ширину */
  justify-content: flex-start;
  height: 100vh;
  padding: 0; /* убираем отступы, чтобы картинка была вплотную к верхней границе */
  border: 2px solid purple;
  background: rgba(128, 0, 128, 0.1);
}



    .content {
      display: flex;
      gap: 5vw;
      align-items: flex-start;
      max-width: 95vw;
      margin: 0 auto;
      justify-content: space-between;
      padding: 3vh 3vw;
      border: 2px solid orange;
      background: rgba(255, 165, 0, 0.1);
    }

    .left-side {
      flex: 0 1 auto;
      max-width: 50vw;
      padding: 2vh 2vw;
      border: 2px solid red;
      background: rgba(255, 0, 0, 0.1);
    }

    .title {
      font-size: 5vw;
      line-height: 1.2;
      white-space: pre-line;
      color: #0ff658;
      text-align: left;
      margin-bottom: 3vh;
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
      font-size: 1.5vw;
      line-height: 1.5;
      margin-bottom: 3vh;
      border: 2px solid green;
      background: rgba(0, 255, 0, 0.1);
    }

    .promo-button {
      background-color: #00FF00;
      color: #ffffff;
      padding: 2vh 3vw;
      border: 2px solid yellow !important;
      border-radius: 5px;
      font-size: 1.5vw;
      cursor: pointer;
      transition: background-color 0.3s;
      width: 30vw;
    }

    .promo-button:hover {
      background-color: #00CC00;
    }

    .tree-image {
      max-height: 80vh;
      object-fit: contain;
      border: 2px solid cyan;
    }

    .right-side {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 5vh;
      margin-left: -8vw;
      padding: 2vh 2vw;
      border: 2px solid pink;
      background: rgba(255, 192, 203, 0.1);
    }

.header-container {
  display: inline-block;
  margin-bottom: 20px;      /* внешний отступ снизу */
  border: 2px solid black;  /* чёткая чёрная рамка */
  background: white;        /* белый фон внутри рамки */
  padding: 20px;            /* внутренние отступы, создающие "поле" вокруг картинки */
  box-sizing: border-box;
}

.content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;           /* убираем max-width, пусть тянется на всю ширину */
  margin: 0;             /* убираем auto-выравнивание */
  padding: 3vh 3vw;      /* можно оставить небольшой паддинг, при необходимости уменьшите */
  border: 2px solid orange;
  background: rgba(255, 165, 0, 0.1);
}

.right-side {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5vh;
  /* Убрать или уменьшить margin-left, чтобы не выходило за границы */
  margin-left: 0; 
  padding: 2vh 2vw;
  border: 2px solid pink;
  background: rgba(255, 192, 203, 0.1);
}



    /* Оставляем только медиа-запрос для мобильных */
    @media (max-width: 768px) {
      .content {
        flex-direction: column;
        gap: 20px;
      }

      .title {
        font-size: 8vw;
        margin-bottom: 20px;
      }

      .description {
        font-size: 4vw;
        margin-bottom: 20px;
      }

      .promo-button {
        width: 80vw;
        font-size: 4vw;
      }

      .tree-image {
        width: 100%;
        height: auto;
        margin-top: 20px;
      }
    }
  </style>