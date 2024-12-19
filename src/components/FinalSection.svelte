<script>
  // Логика компонента, если необходимо
</script>

<div class="final-section">
  <div class="stream-schedule">
    <h2 class="schedule-title">Расписание стримов</h2>
    <div class="schedule-frame">
      <div class="stream-info">
        <p class="stream-date">14 января 14:00 Мск</p>
        <p class="stream-description">Расскажем про спецпроект и призы</p>
        <a href="#" class="stream-link">Смотреть</a>
      </div>
      <div class="bell"></div>
    </div>
  </div>
  <div class="footer-frame">
    <div class="footer-content">
      <p class="agreement-text">Пользовательское соглашение</p>
      <div class="logo" style="display: none;"></div>
    </div>
    <div class="footer-content">
      <p class="developer-text">Разработчик проекта:</p>
      <div class="logo">
        <div class="vector"></div>
        <div class="vector"></div>
        <div class="vector"></div>
      </div>
    </div>
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
    background: #15154D;
    border-radius: 16px;
    margin: 0 auto;
  }

  .stream-schedule, .footer-frame {
    width: 100%;
  }

  .schedule-title {
    font-family: 'TT Travels';
    font-weight: 600;
    font-size: 36px;
    line-height: 43px;
    color: #FFFFFF;
    margin-bottom: 32px;
  }

  .schedule-frame {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
    width: 100%;
  }

  .stream-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stream-date, .stream-description, .stream-link {
    font-family: 'TT Travels';
  }

  .stream-date {
    font-weight: 500;
    font-size: 18px;
    line-height: 22px;
    color: #ABBAF0;
  }

  .stream-description, .stream-link {
    font-weight: 600;
    font-size: 24px;
    line-height: 29px;
  }

  .stream-description {
    color: #FFFFFF;
  }

  .stream-link {
    color: #00AB4E;
    text-decoration: none;
  }

  .bell {
    position: absolute;
    width: 200px;
    height: 200px;
    background: url('/images/bell.png') no-repeat center center;
    background-size: cover;
  }

  @media (max-width: 768px) {
    .final-section {
      padding: 32px;
    }

    .schedule-frame {
      flex-direction: column;
      gap: 16px;
    }

    .schedule-title {
      font-size: 28px;
    }

    .stream-description, .stream-link {
      font-size: 20px;
    }
  }
</style>
