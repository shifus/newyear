<script>
  // Логика компонента, если необходимо
</script>

<section class="screen first-screen">
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
      Лига ставок, поздравляет всех с Новым Годом! Желает всего да побольше, особенно больше высоких выигрышных кэфов! 
      И анонсирует новый спецпроект, где больше однозначно лучше! 
      Получите уникальный промокод для участия в розыгрыше
    </p>
    <p class="description">
      Заключайте пари на высокие коэффициенты. Призы достануся 100 одателям самых больших выигрышных кэфов!
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

<section class="second-screen">
  <img src="/images/второй_экран.png" alt="Описание призов" class="second-screen-image">
</section>

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
          <p>Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Расписание стримов смотрите ниже</p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
.screen {
display: flex;
flex-direction: column;
align-items: stretch;
justify-content: flex-start;
padding: 0;
}

.first-screen {
  border: 2px solid purple;
  background: rgba(128, 0, 128, 0.1);
  min-height: 100vh;
}

.header-image {
display: block;
width: 100%;
height: auto;
margin: 0;
border: 2px solid #555;
background: rgba(128, 128, 128, 0.1);
box-sizing: border-box;
padding: 0;
}

.content {
display: flex;
gap: 5vw;
align-items: flex-start;
max-width: 95vw;       /* Возвращаем исходную ширину и автоцентрирование для десктопа */
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
margin-left: -8vw; /* Возвращаем как было на десктопе */
padding: 2vh 2vw;
border: 2px solid pink;
background: rgba(255, 192, 203, 0.1);
}

/* Мобильная версия */
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
    margin-left: -5vw; /* Отрицательный отступ слева сдвинет елку влево */
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
    margin-top: 0;
  }
}

.second-screen {
  width: 100%;
  margin-top: 0;
}

.second-screen-image {
  width: 100%;
  height: auto;
  display: block;
}

@media (max-width: 768px) {
  .second-screen {
    width: 100%;
    margin-top: 0;
  }

  .second-screen-image {
    width: 100%;
    height: auto;
  }
}

.third-screen {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5vw;
  background: linear-gradient(180deg, #0F0F37 0%, #1A1A4F 100%);
}

.leaderboard-container {
  display: flex;
  gap: 4vw;
  max-width: 95vw;
  width: 100%;
}

.leaderboard-left {
  flex: 1;
}

.leaderboard-title {
  font-size: 4vw;
  margin-bottom: 2vh;
  font-weight: bold;
  text-transform: uppercase;
}

.leaderboard-description {
  font-size: 2vw;
  margin-bottom: 2vh;
  line-height: 1.4;
  opacity: 0.9;
}

.previous-winners-link {
  font-size: 1.8vw;
  margin-bottom: 3vh;
}

.table-frame {
  padding: 3vw;
  gap: 2vw;
  width: 60vw;
  height: auto;
  min-height: 60vh;
  background: rgba(15, 15, 55, 0.7);
  border-radius: 2vw;
}

.leaderboard-right {
  width: 25vw;
}

.action-button {
  width: 100%;
  padding: 1.5vh 2vw;
  margin-bottom: 2vh;
  border-radius: 1vw;
  font-size: 1.8vw;
}

.promo-description {
  font-size: 1.2vw;
  margin-bottom: 3vh;
  line-height: 1.4;
}

.additional-info {
  padding: 2vw;
  border-radius: 1vw;
}

.additional-info p {
  font-size: 1vw;
  margin-bottom: 1vh;
}

@media (max-width: 768px) {
  .leaderboard-container {
    flex-direction: column;
  }

  .table-frame {
    width: 100%;
    height: auto;
  }

  .leaderboard-right {
    width: 100%;
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
}
</style>
