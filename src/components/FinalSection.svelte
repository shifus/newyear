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
  isolation: isolate;
  position: relative;
  width: 1392px;
  background: #15154D;
  border-radius: 16px;
}

.stream-schedule {
  width: 100%;
  height: 379px;
  position: relative;
}

.schedule-title {
  font-family: 'TT Travels';
  font-weight: 600;
  font-size: 36px;
  line-height: 43px;
  color: #FFFFFF;
  width: 1264px;
  margin-bottom: 32px;
}

.schedule-frame {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  width: 1264px;
  height: 176px;
}

.stream-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stream-date {
  font-family: 'TT Travels';
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  color: #ABBAF0;
}

.stream-description {
  font-family: 'TT Travels';
  font-weight: 600;
  font-size: 24px;
  line-height: 29px;
  color: #FFFFFF;
}

.stream-link {
  font-family: 'TT Travels';
  font-weight: 600;
  font-size: 24px;
  line-height: 29px;
  color: #00AB4E;
  text-decoration: none;
}

.bell {
  position: absolute;
  width: 200px;
  height: 200px;
  left: calc(50% - 100px + 548px);
  top: calc(50% - 100px - 35.5px);
  background: url('/images/bell.png') no-repeat center center;
  background-size: cover;
}

.footer-frame {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 32px 64px;
  gap: 32px;
  width: 1392px;
  height: 112px;
  background: #15154D;
  border-radius: 16px;
  position: relative;
}

.footer-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 680px;
}

.developer-text, .agreement-text {
  font-family: 'TT Travels';
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  color: #FFFFFF;
}

.logo {
  width: 48px;
  height: 48px;
  background: #FFFFFF;
  border-radius: 4px;
  position: relative;
}

.logo::after {
  content: '';
  position: absolute;
  width: 36px;
  height: 33.12px;
  left: 5.47px;
  top: 7.2px;
  background: url('/images/vector.png') no-repeat center center;
  background-size: cover;
}

.vector {
  position: absolute;
  left: 21.39%;
  right: 13.61%;
  top: 15%;
  bottom: 49%;
  background: #242430;
}

.vector:nth-child(2) {
  left: 22.39%;
  right: 14.61%;
  top: 55%;
  bottom: 16%;
  background: #242430;
}

.vector:nth-child(3) {
  left: 11.39%;
  right: 81.61%;
  top: 77%;
  bottom: 16%;
  background: #FF4B37;
}

@media (max-width: 768px) {
  .final-section {
    width: 100%;
    padding: 16px;
  }

  .schedule-frame, .footer-frame {
    flex-direction: column;
    gap: 16px;
  }

  .schedule-title, .stream-info, .footer-content {
    width: 100%;
  }

  .bell {
    position: relative;
    width: 100%;
    height: auto;
    left: 0;
    top: 0;
  }
}
</style>
