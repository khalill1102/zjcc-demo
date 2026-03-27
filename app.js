const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const state = {
  points: store.get("zj_points", 0),
  simSteps: store.get("zj_sim_steps", []),
  shares: store.get("zj_shares", []),
  farmRecords: store.get("zj_farm_records", []),
  qaList: store.get("zj_qa_list", []),
  newsList: store.get("zj_news_list", []),
  cart: store.get("zj_cart", 0)
};

function saveState() {
  store.set("zj_points", state.points);
  store.set("zj_sim_steps", state.simSteps);
  store.set("zj_shares", state.shares);
  store.set("zj_farm_records", state.farmRecords);
  store.set("zj_qa_list", state.qaList);
  store.set("zj_news_list", state.newsList);
  store.set("zj_cart", state.cart);
}

function nowText() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
}

function showToast(text) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function openModal(title, html) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  if (!modal || !modalTitle || !modalBody) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.remove("show");
}

function updatePoints(val, reason = "") {
  state.points += val;
  saveState();
  renderPoints();
  showToast(`+${val}积分${reason ? "｜" + reason : ""}`);
}

function renderPoints() {
  document.querySelectorAll(".js-point-value").forEach(el => {
    el.textContent = state.points;
  });
}

function bindCommon() {
  renderPoints();

  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modalClose");
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.querySelectorAll("[data-scroll-top]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-open-intro]").forEach(btn => {
    btn.addEventListener("click", () => {
      openModal(
        "平台简介",
        `
        <p><strong>紫金蝉茶全链数智服务平台</strong>聚焦消费端体验、茶农端管理、茶企端运营、政府端监管四大场景。</p>
        <p>平台围绕互动体验、农事记录、品牌运营、产销对接、数据监管等功能，形成体验吸流、服务承接、消费转化的完整链路。</p>
        <p>当前页面已包含互动体验、品茗分享、农事记录、智能匹配、动态发布、监管总览等核心模块。</p>
        `
      );
    });
  });
}

function initHome() {
  const explainBtns = document.querySelectorAll("[data-home-flow]");
  explainBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      openModal(
        "运营闭环",
        `
        <p><strong>体验吸流 → 平台承接 → 全链服务 → 消费转化</strong></p>
        <p>1. 通过线上互动、社交传播、线下扫码等方式引流；</p>
        <p>2. 平台承接用户完成采茶制茶体验、溯源查看、商城浏览、茶旅预约；</p>
        <p>3. 茶农、茶企、政府分别进入对应模块进行记录、管理与监管；</p>
        <p>4. 通过积分、分享、下单、活动预约实现转化与留存。</p>
        `
      );
    });
  });
}

function initConsumer() {
  const stepButtons = document.querySelectorAll(".step-btn");
  const simulateBar = document.getElementById("simulateBar");
  const simulateText = document.getElementById("simulateText");

  function renderSim() {
    if (!simulateBar || !simulateText) return;
    stepButtons.forEach(btn => {
      btn.classList.toggle("done", state.simSteps.includes(btn.dataset.step));
    });
    const progress = Math.min((state.simSteps.length / 4) * 100, 100);
    simulateBar.style.width = progress + "%";

    if (state.simSteps.length === 0) {
      simulateText.textContent = "点击步骤开始体验采茶制茶流程。";
    } else if (state.simSteps.length < 4) {
      simulateText.textContent = `已完成：${state.simSteps.join("、")}。继续完成剩余流程。`;
    } else {
      simulateText.innerHTML = "已完成采摘、凉青、揉捻、提香全流程，已解锁体验奖励。";
    }
  }

  stepButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const step = btn.dataset.step;
      if (!state.simSteps.includes(step)) {
        state.simSteps.push(step);
        saveState();
        renderSim();
        updatePoints(10, "互动体验");
      } else {
        showToast("该步骤已完成");
      }
    });
  });

  const btnCompleteSim = document.getElementById("btnCompleteSim");
  if (btnCompleteSim) {
    btnCompleteSim.addEventListener("click", () => {
      state.simSteps = ["采摘鲜叶", "摊青凉青", "揉捻做形", "烘干提香"];
      saveState();
      renderSim();
      updatePoints(20, "完成整套流程");
    });
  }

  const btnResetSim = document.getElementById("btnResetSim");
  if (btnResetSim) {
    btnResetSim.addEventListener("click", () => {
      state.simSteps = [];
      saveState();
      renderSim();
      showToast("流程已重置");
    });
  }

  document.querySelectorAll(".quiz-option").forEach(btn => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.correct === "true";
      const explain = btn.dataset.explain;
      const result = document.getElementById("quizResult");
      if (result) result.innerHTML = explain;
      if (correct) updatePoints(20, "知识答题");
    });
  });

  function randomTraceCode() {
    const n = Math.floor(Math.random() * 900 + 100);
    return `ZJCC-2025-08${Math.floor(Math.random() * 9) + 1}-${n}`;
  }

  const btnRandomTrace = document.getElementById("btnRandomTrace");
  if (btnRandomTrace) {
    btnRandomTrace.addEventListener("click", () => {
      const input = document.getElementById("traceCode");
      if (input) input.value = randomTraceCode();
      showToast("已生成溯源码");
    });
  }

  const btnTrace = document.getElementById("btnTrace");
  if (btnTrace) {
    btnTrace.addEventListener("click", () => {
      const codeInput = document.getElementById("traceCode");
      const result = document.getElementById("traceResult");
      const code = codeInput && codeInput.value.trim() ? codeInput.value.trim() : randomTraceCode();
      if (result) {
        result.innerHTML = `
          <strong>溯源结果：${code}</strong><br>
          茶园位置：紫金县生态茶园示范区<br>
          生态数据：空气Ⅰ级，水质Ⅱ级，虫咬程度适中<br>
          采摘等级：一芽二叶<br>
          制作批次：2025年秋季批次<br>
          制茶师：陈师傅<br>
          流通状态：已入库 / 可销售
        `;
      }
      updatePoints(10, "查看溯源");
    });
  }

  document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.cart += 1;
      saveState();
      updatePoints(30, "加入购物车");
      showToast(`已加入：${btn.dataset.name}`);
    });
  });

  const bookingDate = document.getElementById("bookingDate");
  if (bookingDate && !bookingDate.value) {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    bookingDate.value = d.toISOString().slice(0, 10);
  }

  const btnBooking = document.getElementById("btnBooking");
  if (btnBooking) {
    btnBooking.addEventListener("click", () => {
      const date = bookingDate ? bookingDate.value : "";
      if (!date) {
        showToast("请选择预约日期");
        return;
      }
      updatePoints(15, "提交预约");
      openModal(
        "预约成功",
        `
        <p>预约日期：<strong>${date}</strong></p>
        <p>预约项目：茶园研学 / 茶旅体验</p>
        <p>系统已为你保留名额，后续可在活动通知中查看详情。</p>
        `
      );
    });
  }

  function renderShares() {
    const shareList = document.getElementById("shareList");
    if (!shareList) return;
    if (!state.shares.length) {
      shareList.innerHTML = `<div class="empty">还没有分享内容，快来发布第一条品茗体验吧。</div>`;
      return;
    }
    shareList.innerHTML = state.shares
      .slice()
      .reverse()
      .map(
        item => `
        <div class="feed-item">
          <div class="feed-meta">${item.name} · ${item.time}</div>
          <div>${item.text}</div>
        </div>
      `
      )
      .join("");
  }

  const btnFillShare = document.getElementById("btnFillShare");
  if (btnFillShare) {
    btnFillShare.addEventListener("click", () => {
      const shareName = document.getElementById("shareName");
      const shareText = document.getElementById("shareText");
      if (shareName) shareName.value = "茶香旅人";
      if (shareText) shareText.value = "今天试了紫金蝉茶红茶，蜜香很明显，茶汤橙红透亮，第三泡以后回甘更舒服，适合盖碗冲泡。";
      showToast("已填入示例内容");
    });
  }

  const btnShare = document.getElementById("btnShare");
  if (btnShare) {
    btnShare.addEventListener("click", () => {
      const shareName = document.getElementById("shareName");
      const shareText = document.getElementById("shareText");
      const name = shareName && shareName.value.trim() ? shareName.value.trim() : "匿名茶友";
      const text = shareText ? shareText.value.trim() : "";
      if (!text) {
        showToast("请输入分享内容");
        return;
      }
      state.shares.push({ name, text, time: nowText() });
      saveState();
      renderShares();
      updatePoints(15, "发布分享");
      if (shareText) shareText.value = "";
      showToast("发布成功");
    });
  }

  renderSim();
  renderShares();
}

function initFarmer() {
  const btnVoice = document.getElementById("btnVoiceRecord");
  if (btnVoice) {
    btnVoice.addEventListener("click", () => {
      const farmNote = document.getElementById("farmNote");
      const farmPicker = document.getElementById("farmPicker");
      if (farmPicker && !farmPicker.value.trim()) farmPicker.value = "李师傅";
      if (farmNote) {
        farmNote.value = "今日天气多云，采摘一芽二叶，虫咬程度适中，叶质柔软，适宜制作蜜香红茶。";
      }
      showToast("语音识别完成");
    });
  }

  const btnPest = document.getElementById("btnPest");
  if (btnPest) {
    btnPest.addEventListener("click", () => {
      const pestValue = document.getElementById("pestValue");
      const val = pestValue ? pestValue.value.trim() : "";
      if (!val) {
        showToast("请填写虫口监测内容");
        return;
      }
      updatePoints(10, "虫口上报");
      openModal(
        "提交成功",
        `
        <p>虫口监测：<strong>${val}</strong></p>
        <p>当前上报信息已同步至茶园数据中心。</p>
        `
      );
    });
  }

  const btnFarmDemo = document.getElementById("btnFarmDemo");
  if (btnFarmDemo) {
    btnFarmDemo.addEventListener("click", () => {
      document.getElementById("farmWeather").value = "多云";
      document.getElementById("farmType").value = "红茶鲜叶";
      document.getElementById("farmFertilizer").value = "有机肥";
      document.getElementById("farmPicker").value = "李师傅";
      document.getElementById("farmNote").value = "今日采摘一芽二叶，虫咬程度适中，鲜叶完整，适合制作蜜香红茶。";
      showToast("已填充记录内容");
    });
  }

  function renderFarmRecords() {
    const farmRecordList = document.getElementById("farmRecordList");
    if (!farmRecordList) return;
    if (!state.farmRecords.length) {
      farmRecordList.innerHTML = `<div class="empty">暂无农事记录。</div>`;
      return;
    }
    farmRecordList.innerHTML = state.farmRecords
      .slice()
      .reverse()
      .map(
        item => `
        <div class="record-item">
          <div class="record-meta">${item.time} · 记录人：${item.picker || "未填写"}</div>
          <div><strong>天气：</strong>${item.weather}</div>
          <div><strong>采摘品类：</strong>${item.type}</div>
          <div><strong>施肥类型：</strong>${item.fertilizer || "未填写"}</div>
          <div><strong>说明：</strong>${item.note || "无"}</div>
        </div>
      `
      )
      .join("");
  }

  const btnFarmSubmit = document.getElementById("btnFarmSubmit");
  if (btnFarmSubmit) {
    btnFarmSubmit.addEventListener("click", () => {
      const weather = document.getElementById("farmWeather").value;
      const type = document.getElementById("farmType").value;
      const fertilizer = document.getElementById("farmFertilizer").value.trim();
      const picker = document.getElementById("farmPicker").value.trim();
      const note = document.getElementById("farmNote").value.trim();

      state.farmRecords.push({
        weather,
        type,
        fertilizer,
        picker,
        note,
        time: nowText()
      });
      saveState();
      renderFarmRecords();
      updatePoints(20, "提交农事记录");
      showToast("记录已保存");
    });
  }

  function answerQuestion(q) {
    if (q.includes("雨")) {
      return "建议雨后适当延长摊放时间，控制鲜叶含水量，避免闷黄，保持香气纯净。";
    }
    if (q.includes("虫") || q.includes("小绿叶蝉")) {
      return "建议持续关注虫口密度，结合茶树长势和叶片状态进行监测，保持适度虫咬水平。";
    }
    if (q.includes("施肥")) {
      return "建议优先采用有机肥管理方式，并结合茶园土壤数据进行分阶段补充。";
    }
    return "建议结合天气、叶质、虫咬程度和目标茶类综合判断，并适时调整采摘与加工节奏。";
  }

  function renderQa() {
    const qaListEl = document.getElementById("qaList");
    if (!qaListEl) return;
    if (!state.qaList.length) {
      qaListEl.innerHTML = `<div class="empty">暂无问答内容。</div>`;
      return;
    }
    qaListEl.innerHTML = state.qaList
      .slice()
      .reverse()
      .map(
        item => `
        <div class="qa-item">
          <div class="news-meta">${item.time}</div>
          <div><strong>问题：</strong>${item.q}</div>
          <div style="margin-top:6px;"><strong>答复：</strong>${item.a}</div>
        </div>
      `
      )
      .join("");
  }

  const btnAsk = document.getElementById("btnAsk");
  if (btnAsk) {
    btnAsk.addEventListener("click", () => {
      const qaQuestion = document.getElementById("qaQuestion");
      const q = qaQuestion ? qaQuestion.value.trim() : "";
      if (!q) {
        showToast("请输入问题");
        return;
      }
      state.qaList.push({
        q,
        a: answerQuestion(q),
        time: nowText()
      });
      saveState();
      renderQa();
      updatePoints(10, "提交技术问题");
      if (qaQuestion) qaQuestion.value = "";
    });
  }

  const btnFillQa = document.getElementById("btnFillQa");
  if (btnFillQa) {
    btnFillQa.addEventListener("click", () => {
      const qaQuestion = document.getElementById("qaQuestion");
      if (qaQuestion) qaQuestion.value = "雨后采摘对蝉茶品质有何影响？";
      showToast("已填入问题");
    });
  }

  renderFarmRecords();
  renderQa();
}

function initEnterprise() {
  const btnMatchFill = document.getElementById("btnMatchFill");
  if (btnMatchFill) {
    btnMatchFill.addEventListener("click", () => {
      const demand = document.getElementById("matchDemand");
      if (demand) {
        demand.value = "需要50g装红茶礼盒500份，预算控制在100元内，适合中秋活动送礼。";
      }
      showToast("已填入需求");
    });
  }

  const btnMatch = document.getElementById("btnMatch");
  if (btnMatch) {
    btnMatch.addEventListener("click", () => {
      const demand = document.getElementById("matchDemand");
      const result = document.getElementById("matchResult");
      const txt = demand ? demand.value.trim() : "";
      if (!txt) {
        showToast("请填写客户需求");
        return;
      }

      let product = "紫金蝉茶红茶 50g 礼盒装";
      let price = "¥88 - ¥98 / 盒";
      let amount = "约 500 - 800 份";

      if (txt.includes("绿茶")) {
        product = "紫金蝉茶绿茶 50g 轻享装";
        price = "¥78 - ¥88 / 盒";
        amount = "约 300 - 600 份";
      }
      if (txt.includes("茶旅") || txt.includes("研学")) {
        product = "茶园研学 / 茶旅体验券";
        price = "¥69 - ¥99 / 人";
        amount = "可按场次预约";
      }

      if (result) {
        result.innerHTML = `
          <strong>匹配建议</strong><br>
          推荐产品：${product}<br>
          建议报价：${price}<br>
          当前可承接量：${amount}<br>
          配套建议：可叠加品鉴卡、品牌故事卡、积分码与茶旅券
        `;
      }
      updatePoints(10, "生成匹配建议");
    });
  }

  function renderNews() {
    const newsListEl = document.getElementById("newsList");
    if (!newsListEl) return;
    if (!state.newsList.length) {
      newsListEl.innerHTML = `<div class="empty">暂无品牌动态。</div>`;
      return;
    }
    newsListEl.innerHTML = state.newsList
      .slice()
      .reverse()
      .map(
        item => `
        <div class="news-item">
          <div class="news-meta">${item.time}</div>
          <div><strong>${item.title}</strong></div>
          <div style="margin-top:6px;">${item.text}</div>
        </div>
      `
      )
      .join("");
  }

  const btnFillNews = document.getElementById("btnFillNews");
  if (btnFillNews) {
    btnFillNews.addEventListener("click", () => {
      const title = document.getElementById("newsTitle");
      const text = document.getElementById("newsText");
      if (title) title.value = "紫金蝉茶秋季品鉴会开始预约";
      if (text) text.value = "本周六开放线下品鉴席位，现场可体验蝉茶冲泡、闻香识茶、茶旅打卡等活动。";
      showToast("已填入动态内容");
    });
  }

  const btnPublishNews = document.getElementById("btnPublishNews");
  if (btnPublishNews) {
    btnPublishNews.addEventListener("click", () => {
      const title = document.getElementById("newsTitle");
      const text = document.getElementById("newsText");
      const t = title ? title.value.trim() : "";
      const c = text ? text.value.trim() : "";
      if (!t || !c) {
        showToast("请填写完整内容");
        return;
      }
      state.newsList.push({
        title: t,
        text: c,
        time: nowText()
      });
      saveState();
      renderNews();
      updatePoints(10, "发布动态");
      if (title) title.value = "";
      if (text) text.value = "";
      showToast("发布成功");
    });
  }

  renderNews();
}

function initGovernment() {
  const refreshGov = document.getElementById("refreshGov");
  if (refreshGov) {
    refreshGov.addEventListener("click", () => {
      showToast("数据已刷新");
    });
  }

  const exportGov = document.getElementById("exportGov");
  if (exportGov) {
    exportGov.addEventListener("click", () => {
      openModal(
        "监管报表",
        `
        <p>已生成本期监管摘要：</p>
        <p>• 农事记录回传率：97%<br>
           • 重点监测茶园点位：28个<br>
           • 活跃茶企：12家<br>
           • 抽检任务状态：进行中</p>
        `
      );
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bindCommon();

  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "consumer") initConsumer();
  if (page === "farmer") initFarmer();
  if (page === "enterprise") initEnterprise();
  if (page === "government") initGovernment();
});