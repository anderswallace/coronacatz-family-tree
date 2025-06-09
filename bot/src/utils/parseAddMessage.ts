/**
 * Utility to parse Discord User IDs from message containing username mentions
 *
 * Returns null if message is malformed or doesn't contain two user IDs
 *
 * @param content - The Discord message
 * @returns User IDs of Child and Parent users
 */
export function parseAddMessage(
  content: string,
): { childId: string; parentId: string } | null {
  // Parse message for 'Add @User1 to @User2' structure
  const match = content.match(/add\s+<@!?(\d+)>\s+to\s+<@!?(\d+)>/i);

  if (!match) {
    return null;
  }

  return { childId: match[1], parentId: match[2] };
}
