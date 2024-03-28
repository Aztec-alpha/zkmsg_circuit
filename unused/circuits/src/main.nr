use dep::{std, std::println};
fn main(secrect: Field, msg: pub Field, hashes: pub [Field; 3]) -> pub Field { // msgAttestation: pub Field,
    let x = [secrect];
    let pubkey = std::hash::mimc::mimc_bn254(x);
    let mut acc = 1;
    for item in hashes {
        acc *= (item - pubkey);
    }
    assert(acc == 0);

    let x = [secrect, msg];
    let msgAttestation = std::hash::mimc::mimc_bn254(x);
    msgAttestation
}

#[test]
fn test_main() {
    let hash = std::hash::mimc::mimc_bn254([1, 2]);
    // Uncomment to make test fail
    // main(1, 1);
    println(hash);
    let res = main(
        1,
        1,
        [
        0x1b0fabf651bd238445d7a85e1116146423c24f8bdee62a728e5af969da335354,
        0x2e016308ece21d05fc3ee8a1397537db7ce93aff5f826daf51a7300c543ba673,
        0x173e7db6826c764253a876c55e0261292a7980c500aa94e66a2387049b578496
    ]
    );
    assert(res == 0x01ab06dca6eaab7fa1ff834018ff6611242fe8744441af84e38f286cf97924df);
}

// use dep::std::println;
// fn main(x: Field, y: pub Field) {
//     assert(x != y);

//     println(f"1..{x}");
// }

// #[test]
// fn test_main() {
//     main(1, 2)
// }
