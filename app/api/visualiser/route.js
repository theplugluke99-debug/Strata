export const maxDuration = 90;

const FLOORING_PROMPTS = {
  "light-oak-lvt":
    "light oak wood effect luxury vinyl tile flooring with warm natural grain, realistic LVT planks",
  "dark-walnut-lvt":
    "dark walnut luxury vinyl tile flooring with rich deep wood grain, polished surface",
  "herringbone-oak":
    "herringbone pattern oak engineered wood parquet flooring, classic chevron arrangement",
  "grey-ash-lvt":
    "grey ash wood effect luxury vinyl tile flooring with cool contemporary grain",
  "light-grey-carpet":
    "light dove grey plush carpet with soft pile texture, warm grey tones",
  "charcoal-carpet":
    "charcoal dark grey plush carpet with deep moody pile, luxurious texture",
  "cream-carpet":
    "cream ivory Saxony carpet with warm soft pile, elegant neutral tones",
  "slate-tile":
    "slate grey large format porcelain tiles with natural stone texture and subtle veining",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const flooring = formData.get("flooring");

    if (!imageFile || !flooring) {
      return Response.json(
        { error: "Missing image or flooring selection" },
        { status: 400 }
      );
    }

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${imageFile.type};base64,${base64}`;

    const flooringDesc =
      FLOORING_PROMPTS[flooring] || "new modern flooring";
    const prompt = `Interior room photograph with ${flooringDesc}. The walls, furniture, windows and room layout are exactly the same. Only the floor surface has changed. Photorealistic interior design photography, well lit, high quality.`;

    const createRes = await fetch(
      "https://api.replicate.com/v1/models/adirik/interior-design/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          input: {
            image: dataUrl,
            prompt,
            negative_prompt:
              "low quality, blurry, worst quality, deformed, watermark, logo, text",
            guidance_scale: 15,
            num_inference_steps: 30,
            prompt_strength: 0.6,
          },
        }),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("[visualiser] Replicate HTTP error:", createRes.status, errText);
      return Response.json(
        { error: "Generation failed. Please try again." },
        { status: 500 }
      );
    }

    const prediction = await createRes.json();

    if (prediction.error) {
      console.error("[visualiser] Replicate error:", prediction.error);
      return Response.json(
        { error: "Generation failed. Please try again." },
        { status: 500 }
      );
    }

    if (prediction.status === "succeeded") {
      const output = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;
      return Response.json({ imageUrl: output });
    }

    // Poll if the sync wait timed out
    const pollUrl = prediction.urls?.get;
    if (!pollUrl) {
      return Response.json(
        { error: "Generation timed out. Please try again." },
        { status: 500 }
      );
    }

    for (let i = 0; i < 15; i++) {
      await sleep(4000);
      const statusRes = await fetch(pollUrl, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      const status = await statusRes.json();
      if (status.status === "succeeded") {
        const output = Array.isArray(status.output)
          ? status.output[0]
          : status.output;
        return Response.json({ imageUrl: output });
      }
      if (status.status === "failed") {
        return Response.json(
          { error: "Generation failed. Please try again." },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: "Generation timed out. Please try again." },
      { status: 500 }
    );
  } catch (err) {
    console.error("[visualiser] Error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
