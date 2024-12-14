<script>
  // Логика компонента, если необходимо
</script>

<section class="screen">
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
align-items: stretch;
justify-content: flex-start;
height: 100vh;
padding: 0;
border: 2px solid purple;
background: rgba(128, 0, 128, 0.1);
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
.content {
  flex-direction: column;
  gap: 20px;

  /* Убираем отступы и центрирование на мобильных,
     чтобы картинка могла растянуться на всю ширину */
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.right-side {
  margin-left: 0; /* Убираем отрицательный отступ на мобильном */
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
  margin-top: 20px;
}
}
</style>
