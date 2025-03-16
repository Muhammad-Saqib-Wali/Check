$(document).ready(function () {
  // Highlight the active link
  const currentPage = window.location.pathname.split("/").pop();
  const navlinks = $(".nav-bar a");
  navlinks.each(function () {
    if ($(this).attr("href") === currentPage) {
      $(this).addClass("active");
    }
  });

  // Toggle navbar on hamburger click
  const $hamburger = $(".hamburger");
  const $navBar = $(".nav-bar");
  if ($hamburger.length && $navBar.length) {
    $hamburger.on("click", function () {
      $navBar.toggleClass("active");
    });
  }

  // FAQ Sections
  $(".fre-question").on("click", function () {
    const $question = $(this);
    const isActive = $question.hasClass("active");

    // Close all questions and reset icons to plus
    $(".fre-question").removeClass("active").each(function () {
      const $icon = $(this).find(".arrow");
      if ($icon.length) {
        $icon.attr("src", "../Icons/plus-solid.svg");
      }
    });
    // Open the clicked question and change its icon to minus
    if (!isActive) {
      $question.addClass("active");
      const $icon = $question.find(".down-arrow");
      if ($icon.length) {
        $icon.attr("src", "../Icons/minus-solid.svg"); 
      }
    }
  });


  // Load Featured Events
  async function loadFeaturedEvents() {
    try {
      const response = await fetch("../json/feature-events.json");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const events = await response.json();
      const cardsContainer = document.getElementById("featured-cards-container");

      if (cardsContainer) {
        cardsContainer.innerHTML = "";

        events.forEach(event => {
          const eventCard = document.createElement("div");
          eventCard.classList.add("featured-event-card");

          eventCard.innerHTML = `
            <div class="featured-event-card-img">
              <img src="${event.image}" alt="${event.name}" />
            </div>
            <div class="featured-event-card-info">
              <h2>${event.name}</h2>
              <p class="price"><strong>Price:</strong> ${event.price}</p>
              <p><strong>Date & Time:</strong> ${event.dateTime}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Category:</strong> ${event.category}</p>
            </div>
            <button class="featured-event-card-button" data-id="${event.id}">Learn More</button>
          `;
          cardsContainer.appendChild(eventCard);
        });

        // Add click event listeners for "Learn More" buttons
        document.querySelectorAll(".featured-event-card-button").forEach(button => {
          button.addEventListener("click", event => {
            const eventId = event.target.getAttribute("data-id");
            const selectedEvent = events.find(e => e.id === parseInt(eventId));
            localStorage.setItem("selectedEvent", JSON.stringify(selectedEvent));
            window.location.href = "event-detail.html";
          });
        });
      }
    } catch (error) {
      console.error("Error loading featured events:", error);

      const cardsContainer = document.getElementById("featured-cards-container");
      if (cardsContainer) {
        cardsContainer.innerHTML = '<p>Failed to load featured events. Please try again later.</p>';
      }
    }
  }

  loadFeaturedEvents();

  // Contact Form Validation and CAPTCHA
  const form = document.getElementById("contact-form");
  const successMessage = document.getElementById("form-success");
  const emailInput = document.getElementById("email");
  const captchaImage = document.getElementById("captcha-image");
  const captchaInput = document.getElementById("captcha");
  const refreshCaptchaButton = document.getElementById("refresh-captcha");
  const errorMessages = form ? form.querySelectorAll(".error-message") : [];
  let currentCaptcha = "";

  if (form && captchaImage && refreshCaptchaButton) {
    function generateCaptcha() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let captcha = "";
      for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return captcha;
    }

    function refreshCaptcha() {
      currentCaptcha = generateCaptcha();
      captchaImage.src = `https://dummyimage.com/150x50/000/fff&text=${currentCaptcha}`;
    }

    refreshCaptchaButton.addEventListener("click", refreshCaptcha);
    refreshCaptcha();

    form.addEventListener("submit", e => {
      e.preventDefault();
      let isValid = true;

      errorMessages.forEach(error => (error.style.display = "none"));

      form.querySelectorAll("input[required], textarea[required]").forEach(field => {
        if (field.value.trim() === "") {
          const errorElement = field.nextElementSibling;
          errorElement.textContent = "This field is required.";
          errorElement.style.display = "block";
          isValid = false;
        }
      });

      if (emailInput && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailInput.value.trim())) {
        const emailError = emailInput.nextElementSibling;
        if (emailError) {
          emailError.textContent = "Please enter a valid email address.";
          emailError.style.display = "block";
        }
        isValid = false;
      }

      if (captchaInput && captchaInput.value !== currentCaptcha) {
        const captchaError = captchaInput.nextElementSibling;
        if (captchaError) {
          captchaError.textContent = "Incorrect CAPTCHA. Please try again.";
          captchaError.style.display = "block";
        }
        isValid = false;
      }

      if (isValid && successMessage) {
        successMessage.style.display = "block";
        form.reset();
        refreshCaptcha();
      }
    });
  }

  // Event Page Logic
  const eventsGrid = document.querySelector(".events-grid");
  const categoryFilter = document.querySelector("#category");
  const cityFilter = document.querySelector("#city");
  const searchInput = document.querySelector("#search");

  if (eventsGrid && categoryFilter && cityFilter && searchInput) {
    fetch("../json/events.json")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(events => {
        renderEventCards(events);

        categoryFilter.addEventListener("change", () => applyFilters(events));
        cityFilter.addEventListener("change", () => applyFilters(events));
        searchInput.addEventListener("input", () => applyFilters(events));
      })
      .catch(error => {
        console.error("Failed to fetch events:", error);
        eventsGrid.innerHTML = "<p>Error loading events. Please try again later.</p>";
      });

    function applyFilters(events) {
      const selectedCategory = categoryFilter.value;
      const selectedCity = cityFilter.value;
      const searchQuery = searchInput.value.toLowerCase();

      let filteredEvents = events;

      if (selectedCategory !== "Select Category") {
        filteredEvents = filteredEvents.filter(
          event => event.category === selectedCategory
        );
      }

      if (selectedCity !== "Select City") {
        filteredEvents = filteredEvents.filter(
          event => event.city === selectedCity
        );
      }

      if (searchQuery) {
        filteredEvents = filteredEvents.filter(
          event => event.name.toLowerCase().includes(searchQuery)
        );
      }

      renderEventCards(filteredEvents);
    }

    function renderEventCards(events) {
      eventsGrid.innerHTML = "";
      if (events.length === 0) {
        eventsGrid.innerHTML = "<p>No events found for the selected filters.</p>";
        return;
      }

      events.forEach(event => {
        const eventCard = document.createElement("div");
        eventCard.classList.add("event-crds");

        eventCard.innerHTML = `
          <div class="event-crds-img">
            <img src="${event.image}" alt="${event.name}" />
          </div>
          <div class="event-crd-info">
            <h2>${event.name}</h2>
            <p class="price"><strong>Price:</strong> ${event.price}</p>
            <p><strong>Date & Time:</strong> ${event.dateTime}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Category:</strong> ${event.category}</p>
          </div>
          <button class="event-crd-button" data-id="${event.id}">Learn More</button>
        `;
        eventsGrid.appendChild(eventCard);
      });

      document.querySelectorAll(".event-crd-button").forEach(button => {
        button.addEventListener("click", e => {
          const eventId = e.target.getAttribute("data-id");
          const selectedEvent = events.find(event => event.id === parseInt(eventId));
          localStorage.setItem("selectedEvent", JSON.stringify(selectedEvent));
          window.location.href = "event-detail.html";
        });
      });
    }
  }

  // Event Detail Page Logic
  const eventBanner = document.querySelector(".event-banner h1");
  const eventDescription = document.querySelector(".event-description p");
  const eventDateTime = document.querySelector(".event-date-time p");
  const eventLocation = document.querySelector(".event-location p");
  const eventImage = document.querySelector(".event-banner");
  const ticketButton = document.querySelector(".get-tickets");

  if (eventBanner && eventDescription && eventDateTime && eventLocation && eventImage) {
    const selectedEvent = JSON.parse(localStorage.getItem("selectedEvent"));

    if (selectedEvent) {
      eventBanner.textContent = selectedEvent.name;
      eventDescription.textContent = selectedEvent.description;
      eventDateTime.innerHTML = `<strong>Date & Time:</strong> ${selectedEvent.dateTime}`;
      eventLocation.innerHTML = `<strong>Location:</strong> ${selectedEvent.location}`;
      eventImage.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${selectedEvent.image}')`;

      ticketButton?.addEventListener("click", () => {
        window.location.href = "contact.html";
      });
    } else {
      document.querySelector(".event-details-container").innerHTML =
        "<p>Error loading event details. Please try again.</p>";
    }
  }

  // Customization Panel Logic
  const customizeIcon = document.getElementById("customize-icon");
  const customizationPanel = document.getElementById("customization-panel");
  const increaseFontButton = document.getElementById("increase-font");
  const decreaseFontButton = document.getElementById("decrease-font");
  const darkModeButton = document.getElementById("dark-mode");
  const lightModeButton = document.getElementById("light-mode");
  const resetPreferencesButton = document.getElementById("reset-preferences");

  const fontSizeStages = [12, 14, 16, 18, 20];
  let currentFontStage = 2;

  function applyFontSize(stage) {
    document.documentElement.style.fontSize = `${fontSizeStages[stage]}px`;
    localStorage.setItem("fontStage", stage);
  }

  if (customizeIcon && customizationPanel) {
    customizeIcon.addEventListener("click", () => {
      const isVisible = customizationPanel.classList.contains("visible");

      if (isVisible) {
        customizationPanel.classList.remove("visible");
        customizationPanel.classList.add("hidden");
        setTimeout(() => (customizationPanel.style.display = "none"), 400);
      } else {
        customizationPanel.style.display = "block";
        customizationPanel.classList.remove("hidden");
        customizationPanel.classList.add("visible");
      }
    });

    increaseFontButton?.addEventListener("click", () => {
      if (currentFontStage < fontSizeStages.length - 1) {
        currentFontStage++;
        applyFontSize(currentFontStage);
      }
    });

    decreaseFontButton?.addEventListener("click", () => {
      if (currentFontStage > 0) {
        currentFontStage--;
        applyFontSize(currentFontStage);
      }
    });

    darkModeButton?.addEventListener("click", () => {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    });

    lightModeButton?.addEventListener("click", () => {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    });

    resetPreferencesButton?.addEventListener("click", () => {
      localStorage.removeItem("fontStage");
      localStorage.removeItem("theme");
      currentFontStage = 2;
      applyFontSize(currentFontStage);
      document.body.classList.remove("dark-mode", "light-mode");
      alert("Preferences reset to default!");
    });

    const savedFontStage = parseInt(localStorage.getItem("fontStage"), 10);
    if (!isNaN(savedFontStage) && fontSizeStages[savedFontStage] !== undefined) {
      currentFontStage = savedFontStage;
      applyFontSize(currentFontStage);
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else if (savedTheme === "light") {
      document.body.classList.add("light-mode");
    }
  }
});
