/** @type {import("../../micro").Component} */
export default async function LineChart({ attributes }) {
    const width = parseInt(attributes.get("width"));
    const height = parseInt(attributes.get("height"));

    const viewWidth = parseInt(attributes.get("viewWidth"));
    const viewHeight = parseInt(attributes.get("viewHeight"));

    const points = attributes.get("points");

    return /* HTML */ ` <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${viewWidth} ${viewHeight}"
        class="line-chart"
    >
        <polyline fill="none" stroke="#d2320a" stroke-width="2" points="${points}" />
    </svg>`;
}

// TODO: Add a function to dynamically add circles to the line chart.
// TODO: Add a title to the line chart.

{
    /* <circle cx="00" cy="120" data-value="" r="4"></circle>
<circle cx="20" cy="60" data-value="" r="4"></circle>
<circle cx="40" cy="80" data-value="" r="4"></circle>
<circle cx="60" cy="20" data-value="" r="4"></circle> */
}
