#!/usr/bin/perl
use strict;
use warnings;

my @english_alphabet = ('a'..'z');
my %english_alphabet_map = map { $_ => $_ } @english_alphabet;
my %letter_bigram_samples; # measurement data from large text file, key is first letter, value is hash table with keys being second letter and values being occurences
my %letter_bigram_probabilities;

sub shift_letters
{
  my ($shift, @sentence) = @_;
  my @new_sentence;
  for (my $i=0; $i<@sentence; $i++) {
    if (defined($english_alphabet_map{$sentence[$i]})) { # shift only if an english letter
      $new_sentence[$i] = chr( (ord($sentence[$i]) - ord($english_alphabet[0]) + $shift) % @english_alphabet + ord($english_alphabet[0]) );
    } else {
      $new_sentence[$i] = $sentence[$i];
    }
  }
  return @new_sentence;
}

sub letter_shift_task
{
  my @sentence = split('', lc($_[0]));
  # try each possible shift
  my $best_sentence;
  my $best_chance = 0.0;
  for (my $shift=1; $shift<@english_alphabet; $shift++) {
    my @try_sentence = shift_letters($shift, @sentence);
    my $english_sentence_chance = 1.0;
    for (my $i=0; $i<(@try_sentence-1); $i++) {   
      my $first = $try_sentence[$i];
      my $second = $try_sentence[$i+1];
      if (defined($english_alphabet_map{$first}) and defined($english_alphabet_map{$second})) {
        $english_sentence_chance *= $letter_bigram_probabilities{$first}{$second};
        $english_sentence_chance *= 10.0; # trick to try keep within the double range
      }
    }
    if ($english_sentence_chance>=$best_chance) {
      $best_chance = $english_sentence_chance;
      $best_sentence = join('',@try_sentence);
    }
    print(join('',@try_sentence)." ==> ".$english_sentence_chance."\n");
  }
  print("\nThe most probable english sentence:\n".$best_sentence."\n");
}

sub letter_bigram_sampling
{
  # apply laplace smoothing with K=1 by adding one fake sample for each possible combination
  foreach my $first (@english_alphabet) { # only english lowercase letters
    foreach my $second (@english_alphabet) {
        $letter_bigram_samples{$first}{$second} = 1;
    }
  }

  # read the text file used for sampling
  # file: http://www.gutenberg.org/cache/epub/1342/pg1342.txt ( The Project Gutenberg EBook of Pride and Prejudice, by Jane Austen )
  open(CORPUS, "pg1342.txt") or die("Cannot open corpus file"); 
  while(my $line = <CORPUS>) {
    #print "$line";
    my @letters = split('', lc($line));
    for (my $i=0; $i<(@letters-1); $i++) {
      my $first = $letters[$i];
      my $second = $letters[$i+1];
      # drop measurements where any of the characters is not a letter
      if (defined($english_alphabet_map{$first}) and defined($english_alphabet_map{$second})) {
        $letter_bigram_samples{$first}{$second}++; # add the sample
      }
    }
  }
  close(CORPUS);

  # normalize to probablity values
  foreach my $first (@english_alphabet) {
    my $N = 0; # all samples for the actual first letter ( total probablity for P(second|first) )
    foreach my $second (@english_alphabet) {
        $N += $letter_bigram_samples{$first}{$second};
    }
    #my $sum = 0.0;
    foreach my $second (@english_alphabet) {
      $letter_bigram_probabilities{$first}{$second} = $letter_bigram_samples{$first}{$second} / $N;
    #  $sum += $letter_bigram_probabilities{$first}{$second};
    #  print($first.">".$second."=".$letter_bigram_samples{$first}{$second}." (".$letter_bigram_probabilities{$first}{$second}.")  ");
    }
    #print("\n");
    #print("sum P(second|'".$first."')=" . $sum."\n"); # check correctness of probability values
  }
}

letter_bigram_sampling();
letter_shift_task('Esp qtcde nzyqpcpynp zy esp ezatn zq Lcetqtntlw Tyepwwtrpynp hld spwo le Olcexzfes Nzwwprp ty estd jplc.');
