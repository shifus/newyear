<script>
  // Логика компонента, если необходимо
</script>

<div class="final-section">
  <h2 class="schedule-title">Расписание стримов</h2>
  <div class="schedule-frame">
    <p class="stream-date">14 января 14:00 Мск</p>
    <p class="stream-description">Расскажем про спецпроект и призы</p>
    <a href="#" class="stream-link">Смотреть</a>
    <div class="bell"></div>
  </div>
  <div class="footer-frame">
    <a href="#" class="user-agreement">Пользовательское соглашение</a>
    <p class="developer-text">Разработчик проекта:</p>
    <img src="/images/Лого.png" alt="Лого" class="logo">
  </div>
</div>

<style>
  .final-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px;
    gap: 32px;
    width: 100%;
    max-width: 1392px;
    margin: 0 auto;
    background: #15154D;
    border-radius: 16px;
  }

  .schedule-title {
    width: 100%;
    max-width: 1264px;
    font-family: 'TT Travels';
    font-weight: 600;
    font-size: 36px;
    color: #FFFFFF;
    text-align: center;
  }

  .footer-frame {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1264px;
    padding: 16px;
    background: #0F0F37;
    border-radius: 16px;
  }

  .developer-text, .user-agreement {
    font-family: 'TT Travels';
    font-weight: 500;
    font-size: 18px;
    color: #FFFFFF;
  }

  .user-agreement {
    text-decoration: none;
    color: #FFFFFF;
  }

  .logo {
    width: 48px;
    height: 48px;
  }
</style>
