import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import FileType from "file-type";

const client = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

export async function mint(
  data: Buffer,
  source: string,
  state: string,
  tags?: { name: string; value: string }[],
  jwk?: JWKInterface | "use_wallet"
): Promise<string> {
  const res = await FileType.fromBuffer(data);
  const type = res?.mime || "text/plain";

  const tx = await client.createTransaction(
    {
      data,
    },
    jwk
  );

  const allTags = [
    { name: "Content-Type", value: type },
    { name: "App-Name", value: "SmartWeaveContract" },
    { name: "App-Version", value: "0.3.0" },
    { name: "Contract-Src", value: source },
    { name: "Init-State", value: JSON.stringify(state) },
    ...(tags || []),
  ];
  for (const tag of allTags) {
    tx.addTag(tag.name, tag.value);
  }

  await client.transactions.sign(tx, jwk);
  await client.transactions.post(tx);

  return tx.id;
}
