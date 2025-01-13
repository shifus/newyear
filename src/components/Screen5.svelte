<!-- Screen5.svelte -->
<script>
  // Логика компонента, если необходимо
</script>

<div class="Screen5">
  <h2 class="schedule-title">Расписание стримов</h2>
  <div class="schedule-frame">
    <div class="schedule-details">
      <p class="stream-date">14 января 14:00 Мск</p>
      <p class="stream-description">Расскажем про спецпроект и призы</p>
      <a href="#" class="stream-link">Смотреть</a>
    </div>
    <div class="bell"></div>
  </div>
  <div class="footer-frame">
    <a href="#" class="user-agreement">Пользовательское соглашение</a>
    <div class="developer-container">
      <p class="developer-text">Разработчик проекта:</p>
      <img src="/images/Лого.png" alt="Лого" class="logo">
    </div>
  </div>
</div>

<style>
  .Screen5 {
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
    font-family: 'TT Travels', sans-serif;
    font-weight: 600;
    font-size: 36px;
    color: #FFFFFF;
    text-align: left;
    margin-left: 20px;
  }

  .schedule-frame {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 32px;
    gap: 16px;
    width: 100%;
    max-width: 1000px;
    background: #0F0F37;
    border-radius: 16px;
  }

  .schedule-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-left: 20px;
  }

  .stream-date, .stream-description, .stream-link {
    font-family: 'TT Travels', sans-serif;
    font-size: 18px;
    color: #FFFFFF;
  }

  .stream-link {
    color: #00AB4E;
    text-decoration: none;
  }

  .bell {
    width: 150px;
    height: 150px;
    margin-top: -90px;
    background: url('/images/bell.png') no-repeat center center;
    background-size: contain;
  }

  .footer-frame {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1000px;
    padding: 16px;
    background: #0F0F37;
    border-radius: 16px;
  }

  .developer-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .developer-text {
    font-family: 'TT Travels', sans-serif;
    font-size: 18px;
    color: #FFFFFF;
  }

  .logo {
    width: 48px;
    height: 48px;
  }

  .user-agreement {
    font-family: 'TT Travels', sans-serif;
    font-weight: 500;
    font-size: 18px;
    color: #FFFFFF;
  }

  .user-agreement {
    text-decoration: none;
    color: #FFFFFF;
  }

  @media (max-width: 768px) {
    .Screen5 {
      padding: 5vw;
      gap: 4vw;
      max-width: 100vw;
    }

    .schedule-title {
      font-size: 6vw;
      margin-left: 5vw;
    }

    .schedule-frame {
      padding: 4vw;
      max-width: 90vw;
      transform: translateX(-5%);
      width: 90%;
      margin: 0;
    }

    .schedule-details {
      margin-left: 3vw;
      gap: 2vw;
    }

    .stream-date, 
    .stream-description, 
    .stream-link {
      font-size: 4vw;
    }

    .bell {
      width: 25vw;
      height: 25vw;
      margin-top: -15vw;
    }

    .footer-frame {
      padding: 4vw;
      max-width: 90vw;
      justify-content: flex-start;
      gap: 0;
      padding-left: 0;
      margin-left: -20px;
    }

    .developer-text, 
    .user-agreement {
      font-size: 4vw;
    }

    .logo {
      width: 12vw;
      height: 12vw;
      margin-left: -20px;
    }

    .developer-container {
      margin-right: auto;
      margin-left: -50px;
    }
  }
</style>
