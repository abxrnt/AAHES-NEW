// ====== Simple Database ======
const pyqData = {
  "2025": {
    "Physics": [
      { qNo: 1, img: "images/2025_phy_q1.jpg", link: "https://example.com/phy1" },
      { qNo: 2, img: "images/2025_phy_q2.jpg", link: "https://example.com/phy2" },
      { qNo: 3, img: "images/2025_phy_q3.jpg", link: "https://example.com/phy3" },
      { qNo: 4, img: "images/2025_phy_q4.jpg", link: "https://example.com/phy4" },
      { qNo: 5, img: "images/2025_phy_q5.jpg", link: "https://example.com/phy5" }
    ],
    "Chemistry": [
      { qNo: 1, img: "https://res.cloudinary.com/dgqvrq3i1/image/upload/v1762009311/1_d5vn2z.jpg", link: "https://example.com/phy1" },
      { qNo: 2, img: "https://res.cloudinary.com/dgqvrq3i1/image/upload/v1762009311/2_fodmaf.jpg", link: "https://example.com/phy2" },
      { qNo: 3, img: "https://res.cloudinary.com/dgqvrq3i1/image/upload/v1762010474/3_bm7u2n.jpg", link: "https://example.com/chem3" },
      { qNo: 4, img: "https://res.cloudinary.com/dgqvrq3i1/image/upload/v1762010475/4_j7sfxu.jpg", link: "https://example.com/chem4" },
      { qNo: 5, img: "https://res.cloudinary.com/dgqvrq3i1/image/upload/v1762010475/5_kjwuan.jpg", link: "https://example.com/chem5" }
    ],
    "Maths": [
      { qNo: 1, img: "images/2025_math_q1.jpg", link: "https://example.com/math1" },
      { qNo: 2, img: "images/2025_math_q2.jpg", link: "https://example.com/math2" },
      { qNo: 3, img: "images/2025_math_q3.jpg", link: "https://example.com/math3" },
      { qNo: 4, img: "images/2025_math_q4.jpg", link: "https://example.com/math4" },
      { qNo: 5, img: "images/2025_math_q5.jpg", link: "https://example.com/math5" }
    ]
  }
};

// ====== Handle Dropdown Selection ======
document.getElementById("loadBtn").addEventListener("click", () => {
  const year = document.getElementById("yearSelect").value;
  const subject = document.getElementById("subjectSelect").value;
  const tableBody = document.getElementById("questionTable");

  tableBody.innerHTML = "";

  if (!year || !subject) {
    tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-red-600 font-semibold">Please select both year and subject</td></tr>`;
    return;
  }

  const data = pyqData[year]?.[subject];

  if (!data) {
    tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-gray-600">No data available for ${subject} (${year})</td></tr>`;
    return;
  }

  data.forEach(q => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="py-3 px-4">${q.qNo}</td>
      <td class="py-3 px-4">
        <img src="${q.img}" alt="Question ${q.qNo}" class="w-40 rounded-md shadow-sm border border-gray-200">
      </td>
      <td class="py-3 px-4 text-center">
        <a href="${q.link}" target="_blank" class="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition">View Solution</a>
      </td>
    `;
    tableBody.appendChild(row);
  });
});
