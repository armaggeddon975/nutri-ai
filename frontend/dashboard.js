async function loadStats(){

  try{

    const response =
    await fetch(
      "https://nutriai-backend-tnht.onrender.com/stats"
    );

    const data =
    await response.json();

    const perguntas =
    data.perguntasFrequentes;

    const alergias =
    data.alergiasUsuario;

    const totalPerguntas =
    Object.values(perguntas)
    .reduce((a,b)=>a+b,0);

    document.getElementById(
      "total-questions"
    ).innerText =
    totalPerguntas;

    document.getElementById(
      "total-allergies"
    ).innerText =
    alergias.length;

    createChart(perguntas);

  }catch(error){

    console.error(error);

  }

}

function createChart(perguntas){

  const ctx =
  document.getElementById(
    "questionsChart"
  );

  new Chart(ctx, {

    type:"bar",

    data:{

      labels:Object.keys(perguntas),

      datasets:[{

        label:"Perguntas",

        data:Object.values(perguntas)

      }]

    },

    options:{

      responsive:true

    }

  });

}

loadStats();