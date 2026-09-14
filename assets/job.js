/* Pozíció aloldal: a ?id= paraméterből tölti a tartalmat, és kezeli a jelentkezést.
   Egy sablon szolgálja ki mind az öt pozíciót; az adat itt él (valódi
   pozícióknál a Next.js migrációkor ez jön majd CMS-ből). */
(function () {
  const DATA = {"jobs": [{"id": "broker-dubai", "title": "Real Estate Broker", "place": "Dubai, UAE", "type": "Full-time", "div": "HEAVEN. Properties", "loc": "dubai", "intro": "Advise international buyers on off-plan and ready property across Dubai, from the first enquiry through to handover. You work with the full developer market and a team that backs every deal.", "do": ["Guide clients from first enquiry to handover on off-plan, ready and commercial property", "Match each client to projects on location, build quality, payment structure and long-term value", "Work with more than 90% of the UAE&rsquo;s leading developers, with first-allocation access", "Prepare tailored proposals within 72 hours and keep every file to the Heaven Standard", "Build long-term client relationships that continue after the keys change hands"], "need": ["Experience in real estate or high-value sales, ideally with international clients", "RERA certification, or readiness to obtain it with our support", "Fluent English; another European or Middle Eastern language is a strong plus", "Clear, honest communication and a disciplined approach to follow-up"]}, {"id": "sales-manager-dubai", "title": "Senior Sales Manager", "place": "Dubai, UAE", "type": "Full-time", "div": "HEAVEN. Properties", "loc": "dubai", "intro": "Lead and coach a team of brokers in Dubai. You own the team&rsquo;s pipeline and results, and make sure every deal meets the Heaven Standard before it reaches a client.", "do": ["Lead, coach and grow a team of real estate brokers", "Own pipeline targets and weekly reporting for your team", "Run quality-assurance reviews on deals before they reach the client", "Build relationships with developer partners and secure allocations", "Support hiring and onboarding of new advisors"], "need": ["Proven track record in real estate sales in Dubai", "Experience leading or mentoring a sales team", "RERA certification", "Strong commercial judgement and a results-driven, fair management style"]}, {"id": "broker-budapest", "title": "Real Estate Broker", "place": "Budapest, Hungary", "type": "Full-time", "div": "HEAVEN. Properties", "loc": "budapest", "intro": "Work from our European base with Central and Western European investors buying property in the UAE, Spain and Thailand. You are their single point of contact across markets.", "do": ["Advise European investors on property in the UAE, Spain and Thailand", "Explain payment plans, ownership structures and the buying process abroad", "Coordinate with our Dubai team and HEAVEN. Consulting on paperwork and residency", "Prepare tailored proposals and stay with each client through to handover", "Represent HEAVEN. at investor events and presentations"], "need": ["Experience in real estate, investment or premium sales", "Fluent Hungarian and English", "Interest in international property markets, especially Dubai", "Willingness to travel to Dubai for training and client visits"]}, {"id": "rental-ops-dubai", "title": "Rental Operations Coordinator", "place": "Dubai, UAE", "type": "Full-time", "div": "HEAVEN. Livings", "loc": "dubai", "intro": "Run the day-to-day operations of our short-term rental portfolio in Dubai, so owners get reliable returns and guests get a five-star stay.", "do": ["Manage listings, pricing and availability across booking platforms", "Handle guest communication, check-ins and on-site issues", "Coordinate cleaning, maintenance and furnishing suppliers", "Prepare monthly performance reports for property owners", "Keep holiday-home licensing and compliance up to date"], "need": ["Experience in hospitality, property management or short-term rentals", "Strong organisation and calm problem-solving under pressure", "Fluent English; Arabic or Russian is a plus", "Familiarity with booking platforms and channel managers"]}, {"id": "marketing-budapest", "title": "Marketing Specialist", "place": "Budapest, Hungary", "type": "Hybrid", "div": "HEAVEN. Motion", "loc": "budapest", "intro": "Plan and run the campaigns that bring qualified buyers and investors to our advisors across four markets, as part of our in-house lead generation division.", "do": ["Plan and run paid social and search campaigns across four markets", "Create content for property launches, events and the Journal", "Track lead quality and cost, and optimise with the sales team", "Coordinate photo, video and podcast production", "Maintain brand consistency across channels"], "need": ["2+ years in digital marketing, ideally in real estate or luxury", "Hands-on experience with Meta and Google Ads", "Strong written English and Hungarian", "An eye for premium visual content"]}], "offer": ["Structured onboarding and continuous training", "Certification support (RERA, DLD, escrow) from day one", "Performance bonuses and public recognition", "A team trip for everyone who hits their targets", "Transparent paths into senior and leadership roles", "Offices in Dubai and Budapest, with new markets opening"]};
  const jobs = DATA.jobs;
  const id = new URLSearchParams(location.search).get('id');
  const job = jobs.find(j => j.id === id) || jobs[0];

  const $ = s => document.getElementById(s);
  const setHTML = (el, v) => { if (el) el.innerHTML = v; };
  const list = xs => xs.map(x => `<li>${x}</li>`).join('');

  document.title = `${job.title} \u2014 Careers \u2014 HEAVEN. Properties`.replace(/&[a-z]+;/g, m => ({'&mdash;':'\u2014','&rsquo;':'\u2019','&amp;':'&'}[m] || m));
  setHTML($('jobCrumb'), job.title);
  setHTML($('jobDiv'), job.div);
  setHTML($('jobTitle'), job.title);
  setHTML($('jobTags'), `<li>${job.place}</li><li>${job.type}</li>`);
  setHTML($('jobIntro'), job.intro);
  setHTML($('jobDo'), list(job.do));
  setHTML($('jobNeed'), list(job.need));
  setHTML($('factPlace'), job.place);
  setHTML($('factType'), job.type);
  setHTML($('factDiv'), job.div);
  setHTML($('applyTitle'), `Apply for ${job.title}`);
  setHTML($('applyFor'), `${job.title} &middot; ${job.place}`);
  const pos = $('applyPosition');
  if (pos) pos.value = `${job.title} — ${job.place}`;

  const others = $('otherJobs');
  if (others) {
    others.innerHTML = jobs.filter(j => j.id !== job.id).map(o => `
      <article class="job" data-loc="${o.loc}">
        <div class="job-main">
          <span class="job-div">${o.div}</span>
          <h3><a href="/job.html?id=${o.id}">${o.title}</a></h3>
        </div>
        <ul class="job-tags"><li>${o.place}</li><li>${o.type}</li></ul>
        <a class="btn-outline job-apply" href="/job.html?id=${o.id}">View position</a>
      </article>`).join('');
  }

  const form = $('applyForm');
  const note = $('applyNote');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      note.className = 'form-note';
      note.textContent = 'Please complete the required fields and accept the terms.';
      const bad = form.querySelector(':invalid');
      if (bad) {
        (bad.closest('.checkfield') || bad).scrollIntoView({ block: 'center' });
        bad.focus({ preventScroll: true });
      }
      return;
    }
    note.className = 'form-note ok';
    note.textContent = 'Thank you — our team will reply within five working days.';
  });
})();
