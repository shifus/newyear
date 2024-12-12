<script>
    // Логика компонента, если необходимо
  </script>
  
  <section class="screen">
    <h1 class="title">
      В НОВЫЙ ГОД<br>
      С ЛИГОЙ СТАВОК
    </h1>
  </section>
  
  <style>
    .screen {
      height: 100vh;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      padding: 20px;
    }

    .title {
      font-size: 60px;
      line-height: 1.2;
      white-space: pre-line;
      color: #ffffff;
      text-align: left;
    }

    .title br {
      margin-bottom: -1.3em;
      display: block;
      content: "";
    }

    /* Большие десктопные экраны */
    @media (min-width: 1200px) {
      .title {
        font-size: 80px;
      }
    }

    /* Планшеты в альбомной ориентации */
    @media (max-width: 1024px) {
      .title {
        font-size: 50px;
      }
    }

    /* Планшеты в портретной ориентации */
    @media (max-width: 768px) {
      .title {
        font-size: 40px;
      }
    }

    /* Мобильные устройства */
    @media (max-width: 480px) {
      .title {
        font-size: 30px;
      }
    }
  </style>