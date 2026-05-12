"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postJson = postJson;
exports.postForm = postForm;
async function postJson(url, body, headers = {}) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
                ? data.error
                : `HTTP ${res.status}`;
        throw new Error(message);
    }
    return data;
}
async function postForm(url, body, headers = {}) {
    const form = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => form.set(key, String(value)));
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...headers,
        },
        body: form.toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = typeof data?.return_message === "string"
            ? data.return_message
            : typeof data?.message === "string"
                ? data.message
                : typeof data?.error === "string"
                    ? data.error
                    : `HTTP ${res.status}`;
        throw new Error(message);
    }
    return data;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvaHR0cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRCQTBCQztBQUVELDRCQStCQztBQTNETSxLQUFLLFVBQVUsUUFBUSxDQUM1QixHQUFXLEVBQ1gsSUFBYSxFQUNiLFVBQWtDLEVBQUU7SUFFcEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQzNCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtZQUNsQyxHQUFHLE9BQU87U0FDWDtRQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztLQUMzQixDQUFDLENBQUE7SUFFRixNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDWixNQUFNLE9BQU8sR0FDWCxPQUFPLElBQUksRUFBRSxPQUFPLEtBQUssUUFBUTtZQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87WUFDZCxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsS0FBSyxLQUFLLFFBQVE7Z0JBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSztnQkFDWixDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBRUQsT0FBTyxJQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVNLEtBQUssVUFBVSxRQUFRLENBQzVCLEdBQVcsRUFDWCxJQUErQyxFQUMvQyxVQUFrQyxFQUFFO0lBRXBDLE1BQU0sSUFBSSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUE7SUFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUU1RSxNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUU7UUFDM0IsTUFBTSxFQUFFLE1BQU07UUFDZCxPQUFPLEVBQUU7WUFDUCxjQUFjLEVBQUUsbUNBQW1DO1lBQ25ELEdBQUcsT0FBTztTQUNYO1FBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7S0FDdEIsQ0FBQyxDQUFBO0lBRUYsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ1osTUFBTSxPQUFPLEdBQ1gsT0FBTyxJQUFJLEVBQUUsY0FBYyxLQUFLLFFBQVE7WUFDdEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjO1lBQ3JCLENBQUMsQ0FBQyxPQUFPLElBQUksRUFBRSxPQUFPLEtBQUssUUFBUTtnQkFDbkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO2dCQUNkLENBQUMsQ0FBQyxPQUFPLElBQUksRUFBRSxLQUFLLEtBQUssUUFBUTtvQkFDakMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLO29CQUNaLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFFRCxPQUFPLElBQVMsQ0FBQTtBQUNsQixDQUFDIn0=