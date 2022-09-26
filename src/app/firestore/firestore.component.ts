import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

interface Item {
  name: string,
};

@Component({
  selector: 'app-firestore',
  templateUrl: './firestore.component.html',
  styleUrls: ['./firestore.component.scss']
})
export class FirestoreComponent implements OnInit {
  private itemDoc: AngularFirestoreDocument<Item>;
  private itemsCollection: AngularFirestoreCollection<Item>;


  item$: Observable<Item | undefined>;
  items$: Observable<Item[]>;


  constructor(private afs: AngularFirestore) {
    // doc
    this.itemDoc = afs.doc<Item>('items/1');
    this.item$ = this.itemDoc.valueChanges();

    // collection
    this.itemsCollection = afs.collection<Item>('items');
    this.items$ = this.itemsCollection.valueChanges();

  }

  ngOnInit(): void {
  }

  update(item: Item) {
    this.itemDoc.update(item);
  }

  addItem(item: Item) {
    this.itemsCollection.add(item);
  }

}
