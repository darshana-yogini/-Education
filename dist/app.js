document.getElementById('printButton').addEventListener('click', () => window.print());

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const stages = {
  culture: {
    label: '배양·숙성', title: '균사가 배지를 고르게 채우는 시간',
    description: '실내 공기보다 배지 내부가 더 뜨거울 수 있습니다. 배지 사이에 공기가 흐르도록 간격을 두고, 녹색·검은색 오염과 이상 발열을 매일 확인합니다.',
    caution: '핵심: 실내 온도만 보지 말고 대표 배지의 중심 온도를 함께 기록하세요.',
    temp: ['23–25℃', '일반 배양 기준'], humidity: ['65–70%', '과습·결로 방지'], light: ['후기 명배양', '원기 형성 준비'], air: ['공기 순환', '열 정체 방지']
  },
  pinning: {
    label: '발이 유도', title: '초기 건조를 막고 원기를 깨우는 시간',
    description: '완숙배지에 수분 자극을 주고 발생실로 옮깁니다. 발이 초기에는 높은 공중습도를 유지하되 배지와 버섯 표면에 물이 오래 고이지 않게 합니다.',
    caution: '핵심: 원기가 보이기 시작하면 직접 살수를 줄이고 공중습도 중심으로 전환하세요.',
    temp: ['15±3℃', '품종별 범위 확인'], humidity: ['약 90%', '발이 초기 기준'], light: ['150–200 lx', '지속적으로 공급'], air: ['짧고 자주', '급격한 건조 방지']
  },
  growth: {
    label: '생육·수확', title: '갓의 색과 단단함을 만드는 시간',
    description: '환기 부족은 대가 길어지고 갓이 작아지는 원인이 됩니다. 표면에 물방울이 오래 남지 않게 하고, 선반 안쪽까지 공기가 움직이는지 확인합니다.',
    caution: '핵심: 고습을 계속 유지하는 것이 목표가 아니라, 마르지 않되 젖어 있지 않게 관리합니다.',
    temp: ['12–18℃', '고품질 일반 예시'], humidity: ['상태 중심', '표면 물방울 금지'], light: ['150–200 lx', '기형·웃자람 방지'], air: ['CO₂ 배출', '직풍은 피하기']
  },
  rest: {
    label: '휴양·재발생', title: '배지가 힘을 회복하는 시간',
    description: '수확 잔여물을 깨끗이 제거한 뒤 배지를 쉬게 합니다. 휴양 중 오염과 무게 변화를 살피고, 다음 발생 전 품종 지침에 맞춰 침수 또는 관수합니다.',
    caution: '핵심: 배지가 지나치게 가볍거나 물러졌다면 일률적으로 재침수하지 말고 상태를 먼저 선별하세요.',
    temp: ['약 20℃', '휴양 일반 예시'], humidity: ['건조 휴양', '과습 억제'], light: ['약한 빛', '직사광선 금지'], air: ['충분한 환기', '오염원 제거']
  }
};

const fieldMap = {
  label: 'stageLabel', title: 'stageTitle', description: 'stageDescription', caution: 'stageCaution'
};

document.querySelectorAll('[data-stage]').forEach((button) => {
  button.addEventListener('click', () => {
    const stage = stages[button.dataset.stage];
    document.querySelectorAll('[data-stage]').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    Object.entries(fieldMap).forEach(([key, id]) => { document.getElementById(id).textContent = stage[key]; });
    [['temp','tempValue','tempNote'],['humidity','humidityValue','humidityNote'],['light','lightValue','lightNote'],['air','airValue','airNote']].forEach(([key, valueId, noteId]) => {
      document.getElementById(valueId).textContent = stage[key][0];
      document.getElementById(noteId).textContent = stage[key][1];
    });
  });
});

const checks = [...document.querySelectorAll('#checklist input')];
const savedChecks = JSON.parse(localStorage.getItem('shiitake-practice-checks') || '[]');
checks.forEach((check, index) => { check.checked = Boolean(savedChecks[index]); });

function updateProgress() {
  const complete = checks.filter((check) => check.checked).length;
  document.getElementById('progressText').textContent = `${complete} / ${checks.length}`;
  document.getElementById('progressBar').style.width = `${(complete / checks.length) * 100}%`;
  localStorage.setItem('shiitake-practice-checks', JSON.stringify(checks.map((check) => check.checked)));
}
checks.forEach((check) => check.addEventListener('change', updateProgress));
document.getElementById('resetChecklist').addEventListener('click', () => { checks.forEach((check) => { check.checked = false; }); updateProgress(); });
updateProgress();

const recordForm = document.getElementById('recordForm');
const recordOutput = document.getElementById('recordOutput');
recordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const time = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  const sentence = `${time} / ${document.getElementById('zoneInput').value} / ${document.getElementById('tempInput').value}℃·${document.getElementById('humidInput').value}% / ${document.getElementById('noteInput').value} / 30분 뒤 재확인`;
  recordOutput.querySelector('p').textContent = sentence;
  recordOutput.hidden = false;
});

document.getElementById('copyRecord').addEventListener('click', async (event) => {
  const text = recordOutput.querySelector('p').textContent;
  try { await navigator.clipboard.writeText(text); event.currentTarget.textContent = '복사됨'; }
  catch { event.currentTarget.textContent = '문장을 선택해 복사하세요'; }
  window.setTimeout(() => { event.currentTarget.textContent = '문장 복사'; }, 1800);
});

const quizAnswers = new Map();
document.querySelectorAll('#quizList fieldset').forEach((fieldset, index) => {
  fieldset.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const isCorrect = button.dataset.choice === fieldset.dataset.answer;
      fieldset.querySelectorAll('button').forEach((item) => item.classList.remove('correct', 'wrong'));
      button.classList.add(isCorrect ? 'correct' : 'wrong');
      fieldset.querySelector('.feedback').textContent = isCorrect ? '정답입니다. 현장에서는 조치 뒤 재확인까지 하세요.' : '다시 생각해 보세요. 과습·오염·구역 편차를 먼저 줄이는 선택이 안전합니다.';
      quizAnswers.set(index, isCorrect);
      const correct = [...quizAnswers.values()].filter(Boolean).length;
      const solved = quizAnswers.size;
      document.getElementById('quizScore').textContent = solved === 3 ? `${correct} / 3 정답 · ${correct === 3 ? '현장 실습 준비 완료!' : '틀린 항목을 한 번 더 확인하세요.'}` : `${solved}문제 풀이 · 현재 ${correct}문제 정답`;
    });
  });
});
