const bodyCoach = {
  weakness: {
    area: "Testing",
    issueType: "missing",
    message: "No test coverage mentioned."
  },
  context: {
    targetRole: "Frontend"
  }
};

const bodyRefine = {
  sectionText: "It uses react and vite.",
  instruction: "Make more technical",
  sectionType: "technicalExplanation",
  context: {
    targetRole: "Senior Frontend"
  }
};

async function test() {
  const r1 = await fetch('http://localhost:3000/api/coach', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(bodyCoach)
  });
  console.log('Coach Result:', await r1.json());

  const r2 = await fetch('http://localhost:3000/api/refine', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(bodyRefine)
  });
  console.log('Refine Result:', await r2.json());
}
test();
