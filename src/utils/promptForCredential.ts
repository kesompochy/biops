import readline from "node:readline";

export async function promptForCredential(providerName: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`Enter the credential for ${providerName}: `, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
