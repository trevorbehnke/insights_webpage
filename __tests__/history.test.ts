/**
 * @jest-environment jsdom
 */
import { getHistory, addToHistory } from "@/lib/history";
import { HistoryEntry } from "@/lib/types";

function makeEntry(slug: string): HistoryEntry {
  return { address: `Address for ${slug}`, lat: 0, lng: 0, slug, timestamp: 0 };
}

beforeEach(() => {
  localStorage.clear();
});

describe("getHistory", () => {
  it("returns empty array when storage is empty", () => {
    expect(getHistory()).toEqual([]);
  });
});

describe("addToHistory", () => {
  it("stores and retrieves an entry", () => {
    addToHistory(makeEntry("abc"));
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].slug).toBe("abc");
  });

  it("replaces duplicate slugs instead of duplicating", () => {
    addToHistory(makeEntry("abc"));
    addToHistory(makeEntry("abc"));
    expect(getHistory()).toHaveLength(1);
  });

  it("caps history at 10 entries", () => {
    for (let i = 0; i < 12; i++) {
      addToHistory(makeEntry(`entry-${i}`));
    }
    expect(getHistory()).toHaveLength(10);
  });
});
